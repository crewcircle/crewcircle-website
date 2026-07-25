#!/usr/bin/env python3
"""
packages/account-setup/setup.py
================================
Master orchestrator. Creates all 16 vendor accounts for the
organisation defined in .env.local, in correct dependency order.

Usage:
    cd packages/account-setup
    uv run python setup.py

Required in .env.local before running:
    CC_EMAIL, CC_FIRST_NAME, CC_LAST_NAME, CC_COMPANY,
    CC_ABN, CC_DOMAIN, CC_AU_PHONE, CC_GITHUB_USERNAME

All credentials written to:
    - .env.master  (local backup, gitignored, 600 permissions)
    - Doppler <CC_DOPPLER_MASTER_PROJECT>/prod  (after Doppler account created)

Progress saved to .setup_progress.json — safe to restart after failure.
"""

import sys
import os
from pathlib import Path

# Ensure package root is on path
sys.path.insert(0, str(Path(__file__).parent))

from config import cfg                          # loads .env.local, validates required vars
from lib.progress import Progress
from lib.doppler_store import DopplerStore
from lib.human_pause import pause

from creators.crazy_domains  import create_crazy_domains
from creators.cloudflare     import create_cloudflare
from creators.github         import create_github
from creators.digitalocean   import create_digitalocean
from creators.pulumi_account import create_pulumi
from creators.supabase       import create_supabase
from creators.doppler        import create_doppler
from creators.stripe         import create_stripe
from creators.anthropic      import create_anthropic
from creators.resend         import create_resend
from creators.twilio         import create_twilio
from creators.dataforseo     import create_dataforseo
from creators.google_cloud   import create_google_cloud
from creators.sentry         import create_sentry
from creators.tally          import create_tally
from creators.uptime_robot   import create_uptime_robot


def main() -> None:
    progress = Progress(".setup_progress.json")
    store    = DopplerStore(master_project=cfg.doppler_master_project)
    ctx      = cfg.as_creator_ctx()

    print(f"""
╔══════════════════════════════════════════════════════════╗
║  Vendor Account Setup                                    ║
╠══════════════════════════════════════════════════════════╣
║  Company : {cfg.company:<44} ║
║  Email   : {cfg.email:<44} ║
║  Domain  : {cfg.domain:<44} ║
╚══════════════════════════════════════════════════════════╝

16 accounts will be created in dependency order.
Progress is saved after each — safe to restart on failure.
You will be asked to take manual action at 5 points.

Press ENTER to begin (Ctrl+C to abort)...
    """)
    input()

    # ── PHASE 1: Foundation ───────────────────────────────────────────────────
    print("\n══ PHASE 1: Foundation ══════════════════════════════════════\n")

    _run(progress, store, ctx, "crazy_domains", "[ 1/16 ] Crazy Domains",
         create_crazy_domains)

    _run(progress, store, ctx, "cloudflare", "[ 2/16 ] Cloudflare",
         create_cloudflare,
         post=lambda r: pause(f"""
ACTION REQUIRED — Change nameservers at Crazy Domains
──────────────────────────────────────────────────────
1. Go to crazydomains.com.au → My Account → Domain Names
2. Click {cfg.domain} → Manage DNS → Nameservers
3. Replace with:
{chr(10).join(f"   {ns}" for ns in r.get("nameservers", []))}

Press ENTER once saved (DNS propagates in 5-30 min).
"""))

    _run(progress, store, ctx, "github", "[ 3/16 ] GitHub",
         create_github)

    # ── PHASE 2: Core infrastructure ─────────────────────────────────────────
    print("\n══ PHASE 2: Core Infrastructure ════════════════════════════\n")

    _run(progress, store, ctx, "digitalocean", "[ 4/16 ] DigitalOcean",
         create_digitalocean)

    _run(progress, store, ctx, "pulumi",        "[ 5/16 ] Pulumi Cloud",
         create_pulumi)

    _run(progress, store, ctx, "supabase",      "[ 6/16 ] Supabase",
         create_supabase)

    _run(progress, store, ctx, "doppler",       "[ 7/16 ] Doppler",
         create_doppler,
         post=lambda r: store.bootstrap_token(r["secrets"].get("DOPPLER_TOKEN", "")))

    # ── PHASE 3: Payments + AI ────────────────────────────────────────────────
    print("\n══ PHASE 3: Payments + AI ═══════════════════════════════════\n")

    _run(progress, store, ctx, "stripe", "[ 8/16 ] Stripe",
         create_stripe,
         post=lambda _: pause(f"""
ACTION REQUIRED — Stripe identity verification
───────────────────────────────────────────────
1. Go to dashboard.stripe.com
2. Click "Verify your identity" banner
3. Enter:
   ABN      : {cfg.abn}
   Company  : {cfg.company}
4. Upload ASIC company extract or ABN certificate

Approval: 1-24 hours. Test mode works immediately.
Press ENTER to continue setup (runs in parallel).
"""))

    _run(progress, store, ctx, "anthropic", "[ 9/16 ] Anthropic", create_anthropic)

    # ── PHASE 4: Email, SMS, Data ─────────────────────────────────────────────
    print("\n══ PHASE 4: Email + SMS + Data ══════════════════════════════\n")

    _run(progress, store, ctx, "resend",     "[10/16 ] Resend",      create_resend)

    _run(progress, store, ctx, "twilio",     "[11/16 ] Twilio",      create_twilio,
         post=lambda r: pause(f"""
ACTION REQUIRED — Twilio AU regulatory bundle
──────────────────────────────────────────────
1. Go to console.twilio.com → Phone Numbers → Regulatory Compliance
2. Create bundle: Business | {cfg.company} | ABN: {cfg.abn}
3. Upload ABN certificate or ASIC extract
4. Assign bundle to number: {r.get("au_number", "")}

Approval: 1-3 business days.
Press ENTER to continue.
"""))

    _run(progress, store, ctx, "dataforseo", "[12/16 ] DataForSEO",  create_dataforseo)

    # ── PHASE 5: Google APIs ──────────────────────────────────────────────────
    print("\n══ PHASE 5: Google Cloud ════════════════════════════════════\n")

    _run(progress, store, ctx, "google_cloud", "[13/16 ] Google Cloud", create_google_cloud,
         post=lambda _: pause(f"""
ACTION REQUIRED — Google OAuth consent screen
──────────────────────────────────────────────
1. console.cloud.google.com → APIs → OAuth consent screen
2. Fill:
   App name         : {cfg.company} Local Biz
   Support email    : {cfg.email}
   Authorised domain: {cfg.domain}
   Developer contact: {cfg.email}
3. Add scope: .../auth/business.manage
4. Submit for verification
5. IMMEDIATELY: Settings → Test users → Add {cfg.email}
   (test user works without waiting for Google approval)

Press ENTER to continue.
"""))

    # ── PHASE 6: Monitoring + Forms ───────────────────────────────────────────
    print("\n══ PHASE 6: Monitoring + Forms ══════════════════════════════\n")

    _run(progress, store, ctx, "sentry",       "[14/16 ] Sentry",       create_sentry)
    _run(progress, store, ctx, "tally",        "[15/16 ] Tally.so",     create_tally)
    _run(progress, store, ctx, "uptime_robot", "[16/16 ] Uptime Robot", create_uptime_robot)

    # ── Summary ───────────────────────────────────────────────────────────────
    print(f"""
╔══════════════════════════════════════════════════════════╗
║  ALL ACCOUNTS CREATED                                    ║
╚══════════════════════════════════════════════════════════╝

Credentials stored in:
  Local backup : packages/account-setup/.env.master  (gitignored)
  Doppler      : {cfg.doppler_master_project}/prod

Pending approvals (background, not blocking):
  Stripe    : identity verification (1-24 hours)
  Twilio    : AU regulatory bundle (1-3 days)
  Google    : OAuth consent screen (use test user immediately)

Next step:
  cd packages/infra
  doppler run --project {cfg.doppler_master_project} --config prod \\
    -- pulumi stack select master && pulumi up --yes

Then spin up your first project:
  ./bin/newproject local-biz-au "Local Biz Automation" "AU SMB suite" 19900
""")

    print("Secrets in Doppler:")
    for key in store.list_keys():
        print(f"  {key}")


def _run(
    progress: Progress,
    store:    DopplerStore,
    ctx:      dict,
    account:  str,
    label:    str,
    creator,
    post=None,
) -> dict:
    """Run a single account creator with progress tracking."""
    if progress.done(account):
        print(f"{label} — already done, skipping")
        return progress.get_meta(account)

    print(f"{label}")
    result = creator(ctx)
    store.set_many(result.get("secrets", {}))
    progress.mark_done(account, result)

    # Show key outputs
    meta = {k: v for k, v in result.items() if k != "secrets"}
    for k, v in meta.items():
        if isinstance(v, str) and v:
            print(f"         ✓ {k}: {v}")

    if post:
        post(result)

    return result


if __name__ == "__main__":
    main()
