import { describe, it, expect, vi } from "vitest";

// We test readRegistry directly by importing the handler module.
// In a real Next.js app this would be an integration test,
// but we test the core logic here.

vi.mock("fs", () => ({
  readFileSync: vi.fn(),
}));

import { readFileSync } from "fs";

describe("registry API", () => {
  it("returns empty projects array when registry.json is missing", async () => {
    vi.mocked(readFileSync).mockImplementation(() => {
      throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
    });

    // Dynamic import to use the mocked fs
    const { GET } = await import("@/app/api/registry/route");
    const response = await GET();
    const data = await response.json();

    expect(data).toEqual({ projects: [] });
  });

  it("returns projects from registry.json when present", async () => {
    const mockRegistry = {
      projects: [
        {
          id: "test-app",
          name: "Test App",
          description: "A test project",
          price_cents: 19900,
          status: "active",
          created_at: "2025-01-01T00:00:00Z",
        },
      ],
    };

    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockRegistry));

    const { GET } = await import("@/app/api/registry/route");
    const response = await GET();
    const data = await response.json();

    expect(data).toEqual(mockRegistry);
  });

  it("handles missing projects key in JSON", async () => {
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({}));

    const { GET } = await import("@/app/api/registry/route");
    const response = await GET();
    const data = await response.json();

    expect(data).toEqual({ projects: [] });
  });

  it("returns 200 status for both cases", async () => {
    // Missing file
    vi.mocked(readFileSync).mockImplementation(() => {
      throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
    });
    const { GET: GET1 } = await import("@/app/api/registry/route");
    const res1 = await GET1();
    expect(res1.status).toBe(200);

    // Valid file
    vi.mocked(readFileSync).mockReturnValue(
      JSON.stringify({ projects: [{ id: "x", name: "X", description: "", price_cents: 0, status: "active", created_at: "" }] })
    );
    const { GET: GET2 } = await import("@/app/api/registry/route");
    const res2 = await GET2();
    expect(res2.status).toBe(200);
  });
});
