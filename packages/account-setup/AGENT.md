# AGENT INSTRUCTIONS: Configure and Run Account Setup
## File: packages/account-setup/AGENT.md

You are an LLM coding agent. Follow these instructions exactly and in order.
Do not skip steps. Do not ask clarifying questions — all required information
is provided here or will be fetched from files you are told to read.

---

## CONTEXT

This monorepo contains a Python package at `packages/account-setup/` that
creates all vendor accounts needed for the CrewCircle infrastructure.
The package uses Playwright to automate browser signups and writes all
credentials to Doppler and a local `.env.master` file.

The package is already written. Your job is to:
1. Verify prerequisites are met
2. Configure the `.env.local` file with values the human provides
3. Install dependencies
4. Run `setup.py` and monitor its output
5. Handle errors by reading logs and retrying failed accounts

---

## STEP 1 — Read existing files first

Before doing anything else, read these files in order:

```
READ: .env.example                               (understand all required vars)
READ: packages/account-setup/config.py           (understand how config loads)
READ: packages/account-setup/setup.py            (understand execution flow)
READ: packages/account-setup/lib/progress.py     (understand resume behaviour)
```

Do not proceed until you have read all four files.

---

## STEP 2 — Check for existing .env.local

```bash
test -f .env.local && echo "EXISTS" || echo "MISSING"
```

If MISSING: copy from example
```bash
cp .env.example .env.local
```

If EXISTS: read it and check which CC_* vars are already filled:
```bash
grep "^CC_" .env.local
```

---

## STEP 3 — Fill required CC_* vars in .env.local

The human must provide these values. Ask for them all at once if not already in .env.local:

| Variable | Description | Example |
|---|---|---|
| CC_EMAIL | Primary email for all accounts | prabhat@crewcircle.com.au |
| CC_FIRST_NAME | Director first name | Prabhat |
| CC_LAST_NAME | Director last name | Singh |
| CC_COMPANY | Registered company name (exact ASIC spelling) | CREW CIRCLE PTY LTD |
| CC_ABN | Australian Business Number | 12 345 678 901 |
| CC_DOMAIN | Primary domain | crewcircle.com.au |
| CC_AU_PHONE | Australian mobile with country code | +61412345678 |
| CC_GITHUB_USERNAME | Desired GitHub username | crewcircle-au |

Write each value to .env.local using sed or direct file edit.
Never print secret values in your output.

Example edit for one var:
```bash
sed -i 's/^CC_EMAIL=.*/CC_EMAIL=value_here/' .env.local
```

After filling all values, verify no CC_* var is empty:
```bash
python3 -c "
import re
missing = []
for line in open('.env.local'):
    m = re.match(r'^(CC_[^=]+)=\s*$', line)
    if m:
        missing.append(m.group(1))
if missing:
    print('MISSING:', missing)
else:
    print('OK: all CC_ vars filled')
"
```

If any CC_* var is still empty, stop and ask the human for the missing value.

---

## STEP 4 — Verify config loads without errors

```bash
cd packages/account-setup
python3 -c "from config import cfg; print('Config OK:', cfg.email, cfg.company)"
```

Expected output: `Config OK: <email> <company>`

If it throws EnvironmentError, the missing var name is in the error message.
Fix it in .env.local and retry.

---

## STEP 5 — Install dependencies

```bash
cd packages/account-setup

# Install uv if not present
which uv || pip install uv --break-system-packages

# Install package dependencies
uv sync

# Install Playwright browser
uv run playwright install chromium
```

Verify:
```bash
uv run python3 -c "from playwright.sync_api import sync_playwright; print('Playwright OK')"
```

---

## STEP 6 — Check for existing progress

```bash
cd packages/account-setup
test -f .setup_progress.json && python3 -c "
import json
data = json.load(open('.setup_progress.json'))
done = list(data['completed'].keys())
print(f'Already completed: {done}')
print(f'Remaining: {16 - len(done)} accounts')
" || echo "No progress file — starting fresh"
```

---

## STEP 7 — Run setup

```bash
cd packages/account-setup
uv run python3 setup.py
```

The script opens a Chromium browser window for each account.
The human watches the browser and intervenes at the 5 human pause points
(nameservers, Stripe identity, Twilio bundle, Google OAuth, card payments).

Monitor stdout for:
- `✓` lines = success
- `⚠` lines = human action needed
- `ERROR` or Python tracebacks = failures to handle

---

## STEP 8 — Handle failures

If setup.py crashes mid-run, re-run it:
```bash
cd packages/account-setup
uv run python3 setup.py
```

Progress is automatically resumed. Already-completed accounts are skipped.

If a specific account fails repeatedly, reset its progress and retry:
```bash
cd packages/account-setup
python3 -c "
from lib.progress import Progress
p = Progress('.setup_progress.json')
p.reset('ACCOUNT_NAME')   # e.g. p.reset('cloudflare')
print('Reset done')
"
uv run python3 setup.py
```

---

## STEP 9 — Verify credentials are stored

After setup.py completes:

Check local backup exists:
```bash
test -f packages/account-setup/.env.master && echo "Local backup OK" || echo "MISSING"
wc -l packages/account-setup/.env.master
```

Check Doppler has secrets (requires DOPPLER_TOKEN to be set):
```bash
source .env.local
doppler secrets --project crewcircle-master --config prod --json 2>/dev/null | \
  python3 -c "import json,sys; d=json.load(sys.stdin); print(f'Doppler: {len(d)} secrets stored')"
```

---

## STEP 10 — Sync .env.master back to .env.local

After setup.py, the credential vars (non-CC_*) in .env.local will still be empty.
Populate them from the generated .env.master:

```bash
python3 - <<'EOF'
import re

master = {}
for line in open("packages/account-setup/.env.master"):
    line = line.strip()
    if "=" in line and not line.startswith("#"):
        k, _, v = line.partition("=")
        master[k.strip()] = v.strip()

local_lines = open(".env.local").readlines()
updated = []
for line in local_lines:
    m = re.match(r'^([A-Z_][A-Z0-9_]*)=\s*$', line)
    if m and m.group(1) in master:
        updated.append(f"{m.group(1)}={master[m.group(1)]}\n")
    else:
        updated.append(line)

open(".env.local", "w").writelines(updated)
print(f"Synced {len(master)} credentials to .env.local")
EOF
```

---

## STEP 11 — Run Pulumi master stack

Now that all credentials exist in .env.local / Doppler, run the master infra stack:

```bash
cd packages/infra

# Install Pulumi Python dependencies
pip install pulumi pulumi-cloudflare pulumi-github \
  pulumiverse-doppler pulumiverse-sentry --break-system-packages

# Add Terraform-bridged providers
pulumi package add terraform-provider supabase/supabase
pulumi package add terraform-provider humanlayer/pulumi-stripe

# Init and run master stack
pulumi stack init master 2>/dev/null || pulumi stack select master
doppler run --project crewcircle-master --config prod -- pulumi up --yes
```

---

## ERROR REFERENCE

| Error message | Cause | Fix |
|---|---|---|
| `EnvironmentError: Missing required env var: CC_*` | .env.local not filled | Fill the named var in .env.local |
| `TimeoutError: No verification email` | Gmail not open in browser | Human opens Gmail, clicks link, presses ENTER |
| `playwright._impl._errors.TimeoutError` | Page element not found | Retry — UI may have changed. Reset account in progress.json |
| `httpx.ConnectError` | Network issue | Check internet, retry |
| `stripe.error.AuthenticationError` | Wrong Stripe key | Check STRIPE_SECRET_KEY in .env.master |
| `doppler: command not found` | Doppler CLI not installed | `brew install dopplerhq/cli/doppler` or `apt install doppler` |
| `pulumi: command not found` | Pulumi CLI not installed | `curl -fsSL https://get.pulumi.com \| sh` |
| GitHub username taken | CC_GITHUB_USERNAME already registered | Change CC_GITHUB_USERNAME in .env.local, reset github in progress |

---

## WHAT YOU MUST NOT DO

- Do not hardcode any email, name, company, ABN, phone, or domain values in any file
- Do not print the contents of .env.local, .env.master, or any secret values in your output
- Do not commit .env.local or .env.master to git
- Do not run `pulumi destroy` on the master stack
- Do not delete .setup_progress.json unless asked by the human

---

## FILE MAP (for reference)

```
monorepo root/
├── .env.example          ← template, committed, no real values
├── .env.local            ← gitignored, real values, you edit this
│
packages/account-setup/
├── setup.py              ← main entry point, run this
├── config.py             ← reads .env.local, single source of truth
├── pyproject.toml        ← dependencies (managed by uv)
├── .env.master           ← auto-generated by setup.py, gitignored
├── .setup_progress.json  ← auto-generated, tracks completion
├── lib/
│   ├── browser.py        ← Playwright helpers
│   ├── doppler_store.py  ← writes credentials to Doppler
│   ├── human_pause.py    ← pauses for human action
│   └── progress.py       ← saves/resumes progress
└── creators/
    ├── anthropic.py      ← one file per account
    ├── cloudflare.py
    ├── crazy_domains.py
    ├── dataforseo.py
    ├── digitalocean.py
    ├── doppler.py
    ├── github.py
    ├── google_cloud.py
    ├── pulumi_account.py
    ├── resend.py
    ├── sentry.py
    ├── stripe.py
    ├── supabase.py
    ├── tally.py
    ├── twilio.py
    └── uptime_robot.py
```
