#!/usr/bin/env node
import { Command } from "commander";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_ENV, VALID_MODES, type DocsMode } from "./defaults.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function templatePathFor(mode: DocsMode): string {
  return join(packageRoot, "templates", `INSTRUCTIONS.${mode}.md`);
}

function ensureInstructions(mode: DocsMode): void {
  const wikiDir = join(process.cwd(), "openwiki");
  const instructionsPath = join(wikiDir, "INSTRUCTIONS.md");

  if (existsSync(instructionsPath)) {
    // Never clobber a repo's hand-edited brief.
    return;
  }

  const template = templatePathFor(mode);
  if (!existsSync(template)) {
    throw new Error(`No INSTRUCTIONS template found for mode "${mode}" at ${template}`);
  }

  mkdirSync(wikiDir, { recursive: true });
  copyFileSync(template, instructionsPath);
}

function runGenerate(mode: DocsMode): void {
  if (!VALID_MODES.includes(mode)) {
    throw new Error(`Invalid mode "${mode}". Expected one of: ${VALID_MODES.join(", ")}`);
  }

  ensureInstructions(mode);

  const env = { ...DEFAULT_ENV, ...process.env };

  const result = spawnSync("npx", ["--yes", "openwiki", "code", "--update", "--print"], {
    stdio: "inherit",
    env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const program = new Command();

program
  .name("crewcircle-docs")
  .description("Generate CrewCircle documentation via OpenWiki with shared org defaults");

program
  .command("generate")
  .description("Run an OpenWiki documentation update")
  .option(
    "--mode <mode>",
    `documentation audience: ${VALID_MODES.join(" | ")}`,
    "engineering"
  )
  .action((options: { mode: string }) => {
    runGenerate(options.mode as DocsMode);
  });

program.parse();
