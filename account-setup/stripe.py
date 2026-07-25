# packages/account-setup/creators/stripe.py
import time, secrets, string, re
from lib.browser import new_browser
from config import cfg


def create_stripe(ctx: dict) -> dict:
    email    = ctx["email"]
    company  = ctx["company"]
    password = _pw()

    pw, browser, context, page = new_browser(headless=False)
    try:
        page.goto("https://dashboard.stripe.com/register")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        page.fill("input[name='email'], input#email", email)
        page.fill("input[name='full_name'], input[placeholder*='name']", ctx["full_name"])
        page.fill("input[name='company_name'], input[placeholder*='company']", company)
        page.fill("input[name='password'], input#password", password)
        page.click("button[type='submit'], button:has-text('Create account')")
        page.wait_for_load_state("networkidle")
        time.sleep(3)

        print(f"         Check {email} for Stripe verification email.")
        print(f"         Click the verification link in that email.")
        input("         Press ENTER once verified... ")

        if page.query_selector("select[name='country']"):
            page.select_option("select[name='country']", "AU")
            time.sleep(1)

        page.wait_for_load_state("networkidle")
        time.sleep(2)

        page.goto("https://dashboard.stripe.com/test/apikeys")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        reveal = page.query_selector("button:has-text('Reveal')")
        if reveal:
            reveal.click()
            time.sleep(2)

        sk, pk = "", ""
        for el in page.query_selector_all("input[readonly], code"):
            val = el.get_attribute("value") or el.inner_text()
            if val.startswith("sk_test_"):
                sk = val
            elif val.startswith("pk_test_"):
                pk = val

        acct_match = re.search(r'acct_([A-Za-z0-9]+)', page.url + page.content())
        acct_id = f"acct_{acct_match.group(1)}" if acct_match else ""

        return {
            "secrets": {
                "STRIPE_SECRET_KEY":      sk,
                "STRIPE_PUBLISHABLE_KEY": pk,
                "STRIPE_ACCOUNT_ID":      acct_id,
                "STRIPE_PASSWORD":        password,
            },
        }
    finally:
        browser.close()
        pw.stop()


def _pw(n: int = 24) -> str:
    return "".join(secrets.choice(string.ascii_letters + string.digits + "!@#$") for _ in range(n))
