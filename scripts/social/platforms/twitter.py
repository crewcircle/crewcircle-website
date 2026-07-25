import logging
from typing import Any

import requests
from requests_oauthlib import OAuth1

logger = logging.getLogger(__name__)

BASE_URL = "https://api.twitter.com/2"


def _auth(config: dict[str, Any]) -> OAuth1:
    return OAuth1(
        client_key=config["api_key"],
        client_secret=config["api_secret"],
        resource_owner_key=config["access_token"],
        resource_owner_secret=config["access_token_secret"],
    )


def _media_auth(config: dict[str, Any]) -> OAuth1:
    return OAuth1(
        client_key=config["api_key"],
        client_secret=config["api_secret"],
        resource_owner_key=config["access_token"],
        resource_owner_secret=config["access_token_secret"],
    )


def _upload_media(image_path: str, auth: OAuth1) -> str:
    upload_url = "https://upload.twitter.com/1.1/media/upload.json"
    with open(image_path, "rb") as f:
        files = {"media": f}
        response = requests.post(upload_url, auth=auth, files=files, timeout=120)
    response.raise_for_status()
    return response.json()["media_id_string"]


def publish(config: dict[str, Any], post: dict[str, Any], dry_run: bool = True) -> dict[str, Any]:
    required = ["api_key", "api_secret", "access_token", "access_token_secret"]
    missing = [k for k in required if not config.get(k)]
    if missing:
        return {"success": False, "platform": "twitter", "message": f"X credentials missing: {missing}"}

    text = post.get("body", "")
    image_path = post.get("image_path")

    if dry_run:
        logger.info("[DRY-RUN] X post: %.160s...", text)
        return {"success": True, "platform": "twitter", "dry_run": True}

    try:
        auth = _auth(config)
        payload: dict[str, Any] = {"text": text}

        if image_path:
            media_id = _upload_media(image_path, _media_auth(config))
            payload["media"] = {"media_ids": [media_id]}

        response = requests.post(f"{BASE_URL}/tweets", auth=auth, json=payload, timeout=60)
        response.raise_for_status()
        tweet_id = response.json().get("data", {}).get("id")
        logger.info("X post published: %s", tweet_id)
        return {"success": True, "platform": "twitter", "tweet_id": tweet_id}
    except Exception as e:
        logger.error("X post failed: %s", e)
        return {"success": False, "platform": "twitter", "message": str(e)}
