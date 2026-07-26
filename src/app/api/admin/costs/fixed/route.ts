import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { createServiceClient } from "@crewcircle/database";

async function checkAuth(): Promise<NextResponse | null> {
  try {
    await requireAdmin();
    return null;
  } catch (e) {
    if (e instanceof Response) {
      return new NextResponse(e.body, { status: e.status, headers: e.headers });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

/**
 * GET  /api/admin/costs/fixed         — list all fixed costs
 * POST /api/admin/costs/fixed         — create new fixed cost
 * PUT  /api/admin/costs/fixed?id=xxx  — update fixed cost
 * DELETE /api/admin/costs/fixed?id=xxx — delete fixed cost
 */

// GET — list all
export async function GET(request: NextRequest): Promise<NextResponse> {
  const unauth = await checkAuth();
  if (unauth) return unauth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const db = createServiceClient();

  if (id) {
    const { data } = await db.from("fixed_costs").select("*").eq("id", id).single();
    return NextResponse.json(data ?? { error: "Not found" });
  }

  const { data } = await db
    .from("fixed_costs")
    .select("*")
    .order("category")
    .order("name");
  return NextResponse.json({ fixed_costs: data ?? [] });
}

// POST — create
export async function POST(request: NextRequest): Promise<NextResponse> {
  const unauth = await checkAuth();
  if (unauth) return unauth;

  const body = await request.json();

  if (!body.name || body.amount_cents == null) {
    return NextResponse.json(
      { error: "name and amount_cents are required" },
      { status: 400 }
    );
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from("fixed_costs")
    .insert({
      name: body.name,
      category: body.category ?? "infrastructure",
      amount_cents: body.amount_cents,
      currency: body.currency ?? "AUD",
      frequency: body.frequency ?? "monthly",
      provider: body.provider ?? null,
      notes: body.notes ?? null,
      active: body.active ?? true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}

// PUT — update
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const unauth = await checkAuth();
  if (unauth) return unauth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await request.json();

  const db = createServiceClient();
  const { data, error } = await db
    .from("fixed_costs")
    .update({
      ...body,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

// DELETE — soft-delete (set active=false)
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const unauth = await checkAuth();
  if (unauth) return unauth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const db = createServiceClient();
  await db
    .from("fixed_costs")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ deleted: true });
}
