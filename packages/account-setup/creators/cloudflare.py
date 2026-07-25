# packages/account-setup/creators/cloudflare.py
"""
Creates Cloudflare account and adds the domain zone.
All identity values come from config.cfg — no hardcoding.
"""
import time
import re
import secrets
import string

from lib.browser import new_browser
from config import cfg


def create_cloudflare(ctx: dict) -> dict:
    email    = ctx["email"]
    domain   = ctx["domain"]
    password = _pw()

    pw, browser, context, page = new_browser(headless=False)
    try:
        # ── Signup ────────────────────────────────────────────────────────────
        page.goto("https://dash.cloudflare.com/sign-up")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        page.fill("input[name='email']", email)
        page.fill("input[name='password']", password)
        page.click("button[type='submit']")
        page.wait_for_load_state("networkidle")
        time.sleep(3)

        # Email verification if prompted
        if "verify" in page.url or page.query_selector("text=Verify your email"):
            print(f"         Check {email} for Cloudflare verification email.")
            gmail = context.new_page()
            gmail.goto("https://mail.google.com")
            gmail.wait_for_load_state("networkidle")
            for _ in range(24):
                time.sleep(5)
                gmail.goto("https://mail.google.com/mail/u/0/#search/from%3Acloudflare+is%3Aunread+verify")
                time.sleep(2)
                rows = gmail.query_selector_all("tr.zA")
                if rows:
                    rows[0].click()
                    time.sleep(2)
                    link = gmail.query_selector("a[href*='cloudflare.com/login']")
                    if link:
                        page.goto(link.get_attribute("href"))
                        page.wait_for_load_state("networkidle")
                        break
            gmail.close()

        # ── Add domain ────────────────────────────────────────────────────────
        page.goto("https://dash.cloudflare.com/?to=/:account/add-site")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        page.fill(
            "input[name='zone-name'], input#zone-name, input[placeholder*='example.com']",
            domain
        )
        page.click("button[type='submit'], button:has-text('Add Site'), button:has-text('Continue')")
        page.wait_for_load_state("networkidle")
        time.sleep(3)

        # Free plan
        free = page.query_selector("text=Free, input[value='free'], button:has-text('Free')")
        if free:
            free.click()
            time.sleep(1)
            cont = page.query_selector("button:has-text('Continue'), button[type='submit']")
            if cont:
                cont.click()
                page.wait_for_load_state("networkidle")
                time.sleep(3)

        cont2 = page.query_selector("button:has-text('Continue'), button:has-text('Done')")
        if cont2:
            cont2.click()
            page.wait_for_load_state("networkidle")
            time.sleep(3)

        # ── Extract nameservers ───────────────────────────────────────────────
        nameservers = []
        body = page.inner_text("body")
        ns_matches = re.findall(r'[a-z]+\.ns\.cloudflare\.com', body)
        nameservers = list(set(ns_matches))

        # ── Zone ID ───────────────────────────────────────────────────────────
        zone_id = ""
        match = re.search(r'/([a-f0-9]{32})/', page.url)
        if match:
            zone_id = match.group(1)
        if not zone_id:
            id_match = re.search(r'Zone ID\s*([a-f0-9]{32})', body)
            if id_match:
                zone_id = id_match.group(1)

        # ── API token ─────────────────────────────────────────────────────────
        page.goto("https://dash.cloudflare.com/profile/api-tokens")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        page.click("button:has-text('Create Token')")
        time.sleep(1)
        template = page.query_selector("button:has-text('Edit zone DNS'), a:has-text('Edit zone DNS')")
        if template:
            template.click()
            time.sleep(2)
        page.click("button:has-text('Continue to summary'), button[type='submit']")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        page.click("button:has-text('Create Token')")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        api_token = ""
        token_el = page.query_selector("code, input[type='text'][readonly], .token-value")
        if token_el:
            api_token = token_el.inner_text().strip() or token_el.get_attribute("value") or ""
        if not api_token:
            api_token = input("         Paste the Cloudflare API token shown on screen: ").strip()

        return {
            "secrets": {
                "CLOUDFLARE_API_TOKEN": api_token,
                "CLOUDFLARE_ZONE_ID":   zone_id,
                "CLOUDFLARE_EMAIL":     email,
                "CLOUDFLARE_PASSWORD":  password,
            },
            "nameservers": nameservers,
            "zone_id":     zone_id,
        }
    finally:
        browser.close()
        pw.stop()


def _pw(length: int = 24) -> str:
    return "".join(secrets.choice(string.ascii_letters + string.digits + "!@#$%") for _ in range(length))
