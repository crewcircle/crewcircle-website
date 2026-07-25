import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { startDeprovisionJob, getJobStatus } from "@/lib/admin/provision";

interface DeprovisionRequest {
  projectId: string;
}

// POST — create a new deprovision job
export async function POST(request: NextRequest): Promise<NextResponse> {
  const { user } = await requireAdmin();
  const body: DeprovisionRequest = await request.json();

  if (!body.projectId) {
    return NextResponse.json(
      { error: "projectId is required" },
      { status: 400 }
    );
  }

  const jobId = await startDeprovisionJob(body.projectId, user.id);
  return NextResponse.json({ jobId }, { status: 202 });
}

// GET — poll job status
export async function GET(request: NextRequest): Promise<NextResponse> {
  await requireAdmin();
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (!jobId)
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });

  const job = await getJobStatus(jobId);
  if (!job)
    return NextResponse.json({ error: "Job not found" }, { status: 404 });

  return NextResponse.json(job);
}
