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

Defaults to `google/gemini-2.5-flash` via OpenRouter. Four cheaper options
were tried and ruled out by real CI runs, not just price research — cheapest
isn't the priority anymore, a run that actually produces output is:

1. `inclusionai/ling-2.6-flash` (literal cheapest tool-calling model on
   OpenRouter at the time) — hit a persistent `429` from its backing
   provider (Novita's shared, non-BYOK pool), twice in a row, not transient.
2. `mistralai/mistral-nemo` — no rate-limit issue, but too weak to follow
   OpenWiki's own init-vs-update reasoning: it looked at recent git log,
   saw unrelated commits, and concluded "wiki already current" without ever
   generating anything, despite `openwiki/` not existing yet in the repo.
3. `qwen/qwen3-30b-a3b-instruct-2507` — inconsistent across runs. One run
   did correctly produce a full first-pass generation (accurate, substantive
   `quickstart.md`, verified by hand against the actual codebase). Two
   subsequent runs on the same repo state failed differently each time: one
   reasoned itself into a no-op ("no edits are required... outside the scope
   of this update run", despite recognizing the wiki was empty and needed
   `--init`-equivalent behavior); the other spent 22 minutes and emitted a
   malformed tool call (`{"name": "read_file", ...}</tool_call>` with no
   matching open tag) instead of properly invoking it, and never recovered.
   Both `ling-2.6-flash` and `qwen3-30b` are Chinese-lab open-weight models;
   the tool-calling-format compliance risk they share on OpenRouter's varied
   backing providers seems to be the actual pattern here, not one bad model.
4. `openai/gpt-oss-120b` — OpenWiki's own startup log flagged it: `Warning:
   model "openai/gpt-oss-120b" is not a known OpenRouter model (it belongs
   to NVIDIA NIM). The request may fail.` It's a real, live model on
   OpenRouter's own catalog, but OpenWiki maintains its own internal preset
   list per provider and doesn't recognize this specific ID there — the run
   degraded silently (finished in 36s, wrote nothing) rather than erroring
   loudly.

`gemini-2.5-flash` was chosen specifically to avoid the failure classes
above: unambiguous model naming (no cross-provider ID collision like
`gpt-oss-120b`'s), a first-party lab (not a shared/aggregated pool like
`ling-2.6-flash`'s), and mature, widely-adopted tool-calling support. Costs
more than the previous options ($0.30/$2.50 per M tokens vs $0.01–0.19), but
for an occasional, opt-in job this is still a trivial absolute cost — a full
repo scan runs a few hundred K tokens, well under $1. Free-tier (`:free`)
models were intentionally not chosen as the default either: they share a
global rate-limited pool (as low as 20 requests/day) too fragile for a CI
job that needs many tool-call round-trips per run. Override per-repo by
setting `OPENWIKI_MODEL_ID` in the calling workflow's environment before
invoking this CLI — it wins over the default.

## Modes

- `engineering` (default, active): OpenWiki's native internal/developer wiki,
  written to `openwiki/`, for coding agents and contributors.
- `client`: end-user product documentation. **Scaffolded but not yet wired
  into any CI workflow.** OpenWiki's code mode writes to a fixed `openwiki/`
  directory with no documented output-path override, so running both modes in
  the same repo needs either a confirmed override flag or generating
  client-mode docs in an isolated checkout and relocating the output
  afterward. Resolve that before adding a `client` job anywhere.
