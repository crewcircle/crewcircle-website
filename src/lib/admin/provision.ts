import { spawn } from "node:child_process";
import path from "node:path";
import { createServiceClient } from "@crewcircle/database";

const INFRA_DIR = path.resolve(process.cwd(), "packages/infra");
const INFRA_BIN = path.join(INFRA_DIR, "bin");

export interface ProvisionJobConfig {
  projectId: string;
  name: string;
  description: string;
  priceCents: number;
}

export interface DeprovisionJobConfig {
  projectId: string;
}

export interface JobStatus {
  id: string;
  project_id: string;
  job_type: "provision" | "deprovision";
  status: "pending" | "running" | "completed" | "failed";
  created_by: string;
  started_at: string | null;
  completed_at: string | null;
  output_log: string;
  error_message: string | null;
  config: Record<string, unknown>;
  created_at: string;
}

// ---- Helpers ----

function getClient() {
  return createServiceClient();
}

function sanitizeLog(output: string): string {
  // Strip ANSI codes and keep last 10KB
  const clean = output.replace(/\x1b\[[0-9;]*m/g, "");
  return clean.slice(-10000);
}

function spawnScript(
  scriptName: string,
  args: string[],
  cwd: string
): { proc: ReturnType<typeof spawn>; promise: Promise<{ code: number | null; output: string; error: string }> } {
  const proc = spawn("bash", [path.join(INFRA_BIN, scriptName), "--non-interactive", ...args], {
    cwd,
    env: { ...process.env },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";
  let errorOut = "";

  proc.stdout?.on("data", (chunk: Buffer) => {
    output += chunk.toString();
  });

  proc.stderr?.on("data", (chunk: Buffer) => {
    errorOut += chunk.toString();
  });

  const promise = new Promise<{ code: number | null; output: string; error: string }>(
    (resolve) => {
      proc.on("close", (code) => {
        resolve({ code, output, error: errorOut });
      });
      proc.on("error", (err) => {
        resolve({ code: -1, output, error: err.message });
      });
    }
  );

  return { proc, promise };
}

async function updateJobOutput(
  jobId: string,
  output: string,
  client: ReturnType<typeof getClient>
) {
  await client
    .from("provisioning_jobs")
    .update({ output_log: sanitizeLog(output) })
    .eq("id", jobId);
}

// ---- Public API ----

/**
 * Start a project provision job.
 * Creates a job record, spawns bin/newproject --non-interactive,
 * and updates the job as the script progresses.
 */
export async function startProvisionJob(
  config: ProvisionJobConfig,
  userId: string
): Promise<string> {
  const client = getClient();

  const { data, error } = await client
    .from("provisioning_jobs")
    .insert({
      project_id: config.projectId,
      job_type: "provision",
      status: "pending",
      created_by: userId,
      config: config as unknown as Record<string, unknown>,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create provision job: ${error?.message ?? "no data"}`);
  }

  const jobId = data.id;

  // Mark running
  await client
    .from("provisioning_jobs")
    .update({ status: "running", started_at: new Date().toISOString() })
    .eq("id", jobId);

  // Spawn asynchronously — on DO droplet this survives the HTTP response
  const { promise } = spawnScript("newproject", [
    config.projectId,
    config.name,
    config.description,
    String(config.priceCents),
  ], INFRA_DIR);

  // Track output periodically
  let aggregateOutput = "";
  const interval = setInterval(async () => {
    await updateJobOutput(jobId, aggregateOutput, client);
  }, 2000);

  // Resolve on completion
  promise.then(async ({ code, output }) => {
    clearInterval(interval);
    aggregateOutput = output;

    if (code === 0) {
      await client
        .from("provisioning_jobs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          output_log: sanitizeLog(output),
        })
        .eq("id", jobId);
    } else {
      await client
        .from("provisioning_jobs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          error_message: `Exit code ${code}`,
          output_log: sanitizeLog(output),
        })
        .eq("id", jobId);
    }
  }).catch(async (err) => {
    clearInterval(interval);
    await client
      .from("provisioning_jobs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: err instanceof Error ? err.message : "Unknown error",
        output_log: sanitizeLog(aggregateOutput),
      })
      .eq("id", jobId);
  });

  return jobId;
}

/**
 * Start a project deprovision job.
 * Same pattern as provision but spawns bin/killproject.
 */
export async function startDeprovisionJob(
  projectId: string,
  userId: string
): Promise<string> {
  const client = getClient();

  const { data, error } = await client
    .from("provisioning_jobs")
    .insert({
      project_id: projectId,
      job_type: "deprovision",
      status: "pending",
      created_by: userId,
      config: { projectId },
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create deprovision job: ${error?.message ?? "no data"}`);
  }

  const jobId = data.id;

  await client
    .from("provisioning_jobs")
    .update({ status: "running", started_at: new Date().toISOString() })
    .eq("id", jobId);

  const { promise } = spawnScript("killproject", [projectId], INFRA_DIR);

  let aggregateOutput = "";
  const interval = setInterval(async () => {
    await updateJobOutput(jobId, aggregateOutput, client);
  }, 2000);

  promise.then(async ({ code, output }) => {
    clearInterval(interval);
    aggregateOutput = output;

    if (code === 0) {
      await client
        .from("provisioning_jobs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          output_log: sanitizeLog(output),
        })
        .eq("id", jobId);
    } else {
      await client
        .from("provisioning_jobs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          error_message: `Exit code ${code}`,
          output_log: sanitizeLog(output),
        })
        .eq("id", jobId);
    }
  }).catch(async (err) => {
    clearInterval(interval);
    await client
      .from("provisioning_jobs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: err instanceof Error ? err.message : "Unknown error",
        output_log: sanitizeLog(aggregateOutput),
      })
      .eq("id", jobId);
  });

  return jobId;
}

/**
 * Get the current status of a provisioning job.
 */
export async function getJobStatus(jobId: string): Promise<JobStatus | null> {
  const client = getClient();
  const { data } = await client
    .from("provisioning_jobs")
    .select("*")
    .eq("id", jobId)
    .single();
  return data as JobStatus | null;
}

/**
 * List recent provisioning jobs (last 20, newest first).
 */
export async function listJobs(): Promise<JobStatus[]> {
  const client = getClient();
  const { data } = await client
    .from("provisioning_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []) as JobStatus[];
}
