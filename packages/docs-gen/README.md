# @crewcircle/docs-gen

Generic, shared wrapper around [OpenWiki](https://github.com/langchain-ai/openwiki)
for CrewCircle repos. One package, one default model, one place to update —
every repo runs the same CLI instead of a copy-pasted CI script.

## Usage

**Not published to npm** — `@crewcircle`'s npm organization has an
unresolved token/permissions issue (org exists, publish still 404s; see
git history on this file / `.github/workflows/release.yml` for the
investigation). Don't `npx @crewcircle/docs-gen` yet, it will fail to
resolve. CrewCircle repos consume this package by building it from source
instead — see `.github/workflows/docs-generate.yml`, which checks out
`crewcircle-website`, runs `npm install && npm run build` inside
`packages/docs-gen`, and invokes `dist/cli.js` directly with `node`. Once
npm publishing is fixed, this can switch back to a plain `npx` install with
no change to the CLI itself.

For manual/local use against a real target repo:

```sh
cd packages/docs-gen && npm install && npm run build
cd /path/to/target-repo
node /path/to/crewcircle-website/packages/docs-gen/dist/cli.js generate --mode=engineering
```

- Writes `openwiki/INSTRUCTIONS.md` from the matching template in
  `templates/` **only if one doesn't already exist** — it never overwrites a
  repo's hand-edited brief.
- Applies the shared defaults from `src/defaults.ts` (provider, model,
  telemetry) unless the calling environment already sets them, then runs
  `openwiki code --update --print`.

Requires `OPENROUTER_API_KEY` in the environment (already provisioned as a
CrewCircle GitHub org secret).

## Model choice

Defaults to `qwen/qwen3-30b-a3b-instruct-2507` via OpenRouter. Two cheaper
options were tried and ruled out by real CI runs, not just price research:

1. `inclusionai/ling-2.6-flash` (literal cheapest tool-calling model on
   OpenRouter at the time) — hit a persistent `429` from its backing
   provider (Novita's shared, non-BYOK pool), twice in a row, not transient.
2. `mistralai/mistral-nemo` — no rate-limit issue, but too weak to follow
   OpenWiki's own init-vs-update reasoning: it looked at recent git log,
   saw unrelated commits, and concluded "wiki already current" without ever
   generating anything, despite `openwiki/` not existing yet in the repo.

`qwen3-30b-a3b-instruct-2507` (30B MoE, ~3.3B active params, 262k context,
tool-calling supported) correctly did a full first-pass generation end to
end — verified via a real run producing accurate, substantive pages (see
PR history on this repo). Costs more than the first two
($0.048/$0.193 per M tokens) but is still cheap in absolute terms, and
correctness matters more than shaving fractions of a cent on a job that
runs occasionally. Free-tier (`:free`) models were intentionally not
chosen as the default either: they share a global rate-limited pool (as
low as 20 requests/day) too fragile for a CI job that needs many
tool-call round-trips per run. Override per-repo by setting
`OPENWIKI_MODEL_ID` in the calling workflow's environment before invoking
this CLI — it wins over the default.

## Modes

- `engineering` (default, active): OpenWiki's native internal/developer wiki,
  written to `openwiki/`, for coding agents and contributors.
- `client`: end-user product documentation. **Scaffolded but not yet wired
  into any CI workflow.** OpenWiki's code mode writes to a fixed `openwiki/`
  directory with no documented output-path override, so running both modes in
  the same repo needs either a confirmed override flag or generating
  client-mode docs in an isolated checkout and relocating the output
  afterward. Resolve that before adding a `client` job anywhere.
