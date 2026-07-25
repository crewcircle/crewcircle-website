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

export interface Registry {
  projects: RegistryProject[];
}

/**
 * Read the project registry from packages/infra/registry.json.
 * Returns an empty registry if the file does not exist (no projects provisioned yet).
 */
export function readRegistry(): Registry {
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

/**
 * Get a single project by ID from the registry.
 * Returns undefined if not found.
 */
export function getProject(id: string): RegistryProject | undefined {
  const registry = readRegistry();
  return registry.projects.find((p) => p.id === id);
}
