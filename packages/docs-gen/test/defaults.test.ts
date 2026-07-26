import { describe, expect, it } from "vitest";
import { DEFAULT_ENV, VALID_MODES } from "../src/defaults";

describe("defaults", () => {
  it("configures the OpenRouter provider with a tool-calling-capable model", () => {
    expect(DEFAULT_ENV.OPENWIKI_PROVIDER).toBe("openrouter");
    expect(DEFAULT_ENV.OPENWIKI_MODEL_ID).toBeTruthy();
    expect(DEFAULT_ENV.OPENWIKI_TELEMETRY_DISABLED).toBe("1");
  });

  it("only exposes the supported documentation modes", () => {
    expect(VALID_MODES).toEqual(["engineering", "client"]);
  });
});
