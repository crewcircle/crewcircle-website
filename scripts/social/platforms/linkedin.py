import logging
from typing import Any

import requests

logger = logging.getLogger(__name__)

BASE_URL = "https://api.linkedin.com/v2"


def _headers(access_token: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
    }


def _build_share_json(author: str, text: str, image_url: str | None = None) -> dict[str, Any]:
    share = {
        "author": author,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": text},
                "shareMediaCategory": "NONE",
            }
        },
        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
    }
    if image_url:
        share["specificContent"]["com.linkedin.ugc.ShareContent"]["shareMediaCategory"] = "IMAGE"
        share["specificContent"]["com.linkedin.ugc.ShareContent"]["media"] = [
            {
                "status": "READY",
                "originalUrl": image_url,
                "title": {"text": "CrewCircle"},
            }
        ]
    return share


def _post(url: str, headers: dict[str, str], json: dict[str, Any]) -> requests.Response:
    response = requests.post(url, headers=headers, json=json, timeout=60)
    response.raise_for_status()
    return response


def publish(config: dict[str, Any], post: dict[str, Any], dry_run: bool = True) -> dict[str, Any]:
    access_token = config.get("access_token")
    author_urn = config.get("author_urn")
    company_urn = config.get("company_urn")
    if not access_token or not author_urn:
        return {"success": False, "platform": "linkedin", "message": "LinkedIn access_token or author_urn missing"}

    text = post.get("body", "")
    image_url = post.get("image_url")
    use_company = post.get("company", False) and company_urn
    author = company_urn if use_company else author_urn

    if dry_run:
        logger.info("[DRY-RUN] LinkedIn post as %s: %.60s...", author, text)
        return {"success": True, "platform": "linkedin", "dry_run": True, "author": author}

    try:
        url = f"{BASE_URL}/ugcPosts"
        payload = _build_share_json(author, text, image_url)
        _post(url, _headers(access_token), payload)
        logger.info("LinkedIn post published as %s", author)
        return {"success": True, "platform": "linkedin", "author": author}
    except Exception as e:
        logger.error("LinkedIn post failed: %s", e)
        return {"success": False, "platform": "linkedin", "message": str(e)}
