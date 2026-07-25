import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { startProvisionJob, getJobStatus, listJobs } from "@/lib/admin/provision";

interface ProvisionRequest {
  projectId: string;
  name: string;
  description: string;
  priceCents: number;
}

// POST — create a new provision job
export async function POST(request: NextRequest): Promise<NextResponse> {
  const { user } = await requireAdmin();
  const body: ProvisionRequest = await request.json();

  // Validate required fields
  if (!body.projectId || !body.name) {
    return NextResponse.json(
      { error: "projectId and name are required" },
      { status: 400 }
    );
  }

  // Validate project-id format
  if (!/^[a-z][a-z0-9-]+$/.test(body.projectId)) {
    return NextResponse.json(
      { error: "projectId must be lowercase letters, numbers, and hyphens" },
      { status: 400 }
    );
  }

  const jobId = await startProvisionJob(
    {
      projectId: body.projectId,
      name: body.name,
      description: body.description ?? "",
      priceCents: body.priceCents ?? 19900,
    },
    user.id
  );

  return NextResponse.json({ jobId }, { status: 202 });
}

// GET — poll job status or list all jobs
export async function GET(request: NextRequest): Promise<NextResponse> {
  await requireAdmin();
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (jobId) {
    const job = await getJobStatus(jobId);
    if (!job)
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    return NextResponse.json(job);
  }

  const jobs = await listJobs();
  return NextResponse.json({ jobs });
}
