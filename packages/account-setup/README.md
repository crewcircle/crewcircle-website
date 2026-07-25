# CrewCircle Monorepo

## Structure

```
crewcircle/
├── .env.example                  ← copy to .env.local, fill values, never commit
├── .env.local                    ← gitignored, your actual values
├── .gitignore
├── turbo.json                    ← Turborepo task graph
├── package.json                  ← workspace root
│
├── apps/
│   └── website/                  ← existing Next.js marketing site
│
└── packages/
    ├── account-setup/            ← one-time vendor account creation (Playwright)
    └── infra/                    ← Pulumi per-project provisioner (run per new idea)
```

## Prerequisites

```bash
# Python 3.11+
pip install uv

# Node 20+ (for website)
nvm install 20 && nvm use 20

# Playwright browsers
cd packages/account-setup
uv run playwright install chromium

# Pulumi CLI
curl -fsSL https://get.pulumi.com | sh
pulumi login
```

## First-time setup

```bash
# 1. Clone repo (website already exists here)
git clone https://github.com/crewcircle-au/crewcircle .
cd crewcircle

# 2. Copy and fill env file
cp .env.example .env.local
# Fill CC_EMAIL, CC_FIRST_NAME, CC_LAST_NAME, CC_COMPANY, CC_ABN,
# CC_DOMAIN, CC_AU_PHONE, CC_GITHUB_USERNAME in .env.local

# 3. Run account creation (one time only, ~2 hours)
cd packages/account-setup
uv run python setup.py

# 4. Run Pulumi master stack (one time, sets up shared infra)
cd ../infra
doppler run --project crewcircle-master --config prod -- \
  pulumi stack select master && pulumi up --yes

# 5. Spin up a new project (run whenever you have a new idea)
packages/infra/bin/newproject local-biz-au "Local Biz Automation" "AU SMB automation" 19900
```

## Adding the account-setup package to existing repo

If your website repo already exists at `apps/website`, this monorepo
wraps it. The website code does not change — it is mounted at `apps/website`.

```bash
# In your existing repo root:
mkdir -p apps
git mv * apps/website/ 2>/dev/null || true
git mv .* apps/website/ 2>/dev/null || true

# Then add monorepo root files:
cp /path/to/this/package.json .
cp /path/to/this/turbo.json .
cp /path/to/this/.env.example .
cp /path/to/this/.gitignore .
mkdir -p packages
cp -r /path/to/account-setup packages/
cp -r /path/to/infra packages/
git add . && git commit -m "restructure: wrap existing site in monorepo"
```
