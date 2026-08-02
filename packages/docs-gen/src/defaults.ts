/**
 * Default OpenWiki configuration shared by every CrewCircle repo.
 * Bump OPENWIKI_MODEL_ID here to change the model for all repos at once —
 * see the model-selection note in the docs-gen README for how this was chosen.
 */
export const DEFAULT_ENV: Record<string, string> = {
  OPENWIKI_PROVIDER: "openrouter",
  OPENWIKI_MODEL_ID: "google/gemini-2.5-flash",
  OPENWIKI_TELEMETRY_DISABLED: "1",
};

export type DocsMode = "engineering" | "client";

export const VALID_MODES: DocsMode[] = ["engineering", "client"];
