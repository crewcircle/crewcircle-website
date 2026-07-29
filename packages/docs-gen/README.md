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

Defaults to `inclusionai/ling-2.6-flash` via OpenRouter — the cheapest model
on OpenRouter's live catalog, at the time this was written, that both supports
tool-calling (required — OpenWiki is an agentic CLI that reads files via tool
calls) and has enough context (262k tokens) to read real source files. Free-tier
(`:free`) models were intentionally not chosen as the default: they share a
global rate-limited pool (as low as 20 requests/day) too fragile for a CI job
that needs many tool-call round-trips per run. Override per-repo by setting
`OPENWIKI_MODEL_ID` in the calling workflow's environment before invoking this
CLI — it wins over the default.

## Modes

- `engineering` (default, active): OpenWiki's native internal/developer wiki,
  written to `openwiki/`, for coding agents and contributors.
- `client`: end-user product documentation. **Scaffolded but not yet wired
  into any CI workflow.** OpenWiki's code mode writes to a fixed `openwiki/`
  directory with no documented output-path override, so running both modes in
  the same repo needs either a confirmed override flag or generating
  client-mode docs in an isolated checkout and relocating the output
  afterward. Resolve that before adding a `client` job anywhere.
