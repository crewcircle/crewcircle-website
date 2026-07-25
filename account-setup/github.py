# packages/account-setup/creators/github.py
import time, secrets, string
from lib.browser import new_browser
from config import cfg


def create_github(ctx: dict) -> dict:
    email    = ctx["email"]
    username = ctx["github_username"]
    password = _pw()

    pw, browser, context, page = new_browser(headless=False)
    try:
        page.goto("https://github.com/signup")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        page.fill("input#email", email)
        page.click("button:has-text('Continue')")
        time.sleep(1)
        page.fill("input#password", password)
        page.click("button:has-text('Continue')")
        time.sleep(1)
        page.fill("input#login", username)
        page.click("button:has-text('Continue')")
        time.sleep(1)
        page.click("button:has-text('Continue')")
        time.sleep(1)

        print(f"         GitHub may show a verification puzzle. Complete it in the browser.")
        input("         Press ENTER once solved... ")

        print(f"         Check {email} for a GitHub verification code.")
        otp = input("         Enter the 6-digit code: ").strip()
        inputs = page.query_selector_all("input[type='text']")
        for i, digit in enumerate(otp):
            if i < len(inputs):
                inputs[i].fill(digit)
        time.sleep(2)

        # Create PAT
        page.goto("https://github.com/settings/tokens/new")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        page.fill("input#token_description", ctx["token_name"])
        page.select_option("select#token_expiration", "0") if page.query_selector("select#token_expiration") else None
        for scope in ["repo", "workflow", "admin:org"]:
            cb = page.query_selector(f"input#user_{scope}, input[value='{scope}']")
            if cb and not cb.is_checked():
                cb.click()
        page.click("button:has-text('Generate token')")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        token_el = page.query_selector("code, .flash-success code, #new-oauth-token")
        github_token = token_el.inner_text().strip() if token_el else ""
        if not github_token:
            github_token = input("         Paste the GitHub PAT shown on screen: ").strip()

        return {
            "secrets": {
                "GITHUB_TOKEN":    github_token,
                "GITHUB_USERNAME": username,
                "GITHUB_EMAIL":    email,
                "GITHUB_PASSWORD": password,
            },
            "username": username,
        }
    finally:
        browser.close()
        pw.stop()


def _pw(n: int = 24) -> str:
    return "".join(secrets.choice(string.ascii_letters + string.digits + "!@#$") for _ in range(n))
