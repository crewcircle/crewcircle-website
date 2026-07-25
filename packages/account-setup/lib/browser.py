"""
Playwright browser helpers for account-setup automation.
Provides a shared browser instance and common page interactions.
"""

from __future__ import annotations
from typing import Any


def new_browser(headless: bool = True) -> tuple[Any, Any, Any, Any]:
    """Create a new Playwright browser instance with context and page.

    Returns:
        Tuple of (playwright, browser, context, page) — caller must
        call ``pw.stop()`` to clean up.
    """
    # TODO: implement Playwright browser automation
    # from playwright.sync_api import sync_playwright
    # pw = sync_playwright().start()
    # browser = pw.chromium.launch(headless=headless)
    # context = browser.new_context()
    # page = context.new_page()
    # return pw, browser, context, page

    raise NotImplementedError("new_browser: Playwright not yet integrated")
