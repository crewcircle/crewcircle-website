import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { resolve } from "path";

export interface RegistryProject {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  status: "active" | "killed";
  created_at: string;
  killed_at?: string;
}

export interface RegistryResponse {
  projects: RegistryProject[];
}

function readRegistry(): RegistryResponse {
  const registryPath = resolve(
    process.cwd(),
    "packages/infra/registry.json"
  );
  try {
    const raw = readFileSync(registryPath, "utf-8");
    const parsed = JSON.parse(raw);
    return { projects: parsed.projects ?? [] };
  } catch {
    return { projects: [] };
  }
}

export async function GET(): Promise<NextResponse> {
  const data = readRegistry();
  return NextResponse.json(data);
}
