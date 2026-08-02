---
type: Package Documentation
title: Account Setup Package
description: Documentation for the account-setup package, responsible for automating vendor account creation.
tags: [package, account-setup, automation, playwright]
---
# Account Setup Package

The `@crewcircle/account-setup` package (`packages/account-setup`) is responsible for automating the one-time creation and configuration of various vendor accounts. It utilizes Playwright for browser automation to interact with vendor portals.

## Purpose

This package streamlines the initial setup process for new projects by programmatically creating accounts on services such as Cloudflare, GitHub, Stripe, and others, as defined in its `creators/` directory.

## Structure

```
packages/account-setup/
├── creators/             ← Modules for specific vendor account creation
│   ├── anthropic.py
│   ├── cloudflare.py
│   ├── crazy_domains.py
│   ├── dataforseo.py
│   ├── digitalocean.py
│   ├── doppler.py
│   ├── github.py
│   ├── google_cloud.py
│   ├── pulumi_account.py
│   ├── resend.py
│   ├── sentry.py
│   ├── stripe.py
│   ├── supabase.py
│   └── tally.py
├── lib/                  ← Helper utilities (browser automation, Doppler integration, human interaction)
│   ├── browser.py
│   ├── doppler_store.py
│   └── human_pause.py
├── setup.py              ← Main script to run account creation
├── config.py             ← Configuration management
└── AGENT.md              ← Agent instructions related to this package
```

## Usage

To run the account setup process, navigate to the package directory and execute the `setup.py` script:

```bash
cd packages/account-setup
uv run python setup.py
```

**Prerequisites:**

*   Python 3.11+
*   `uv` (or `pip`)
*   Playwright browsers installed (e.g., `uv run playwright install chromium`)
*   Environment variables configured in `.env.local` (e.g., `CC_EMAIL`, `CC_COMPANY`, `CC_GITHUB_USERNAME`). Refer to `packages/account-setup/.env.example` for required variables.

## Key Functionality

*   **Automated Account Creation**: Scripts within `creators/` handle the specific logic for creating accounts on different platforms.
*   **Browser Automation**: Leverages Playwright to simulate user interactions with web interfaces.
*   **Doppler Integration**: The `lib/doppler_store.py` module suggests integration with Doppler for secure secret management.
*   **Human Interaction**: `lib/human_pause.py` indicates points where manual intervention or verification might be required during the automated process.
