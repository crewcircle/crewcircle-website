import logging
from typing import Any

logger = logging.getLogger(__name__)


def publish(config: dict[str, Any], post: dict[str, Any], dry_run: bool = True) -> dict[str, Any]:
    if not config.get("client_id") or not config.get("refresh_token"):
        return {"success": False, "platform": "youtube", "message": "YouTube OAuth credentials missing"}

    title = post.get("title", "")
    description = post.get("body", "")
    video_path = post.get("video_path")

    if dry_run:
        logger.info("[DRY-RUN] YouTube upload: %s (%s)", title, video_path or "no video")
        return {"success": True, "platform": "youtube", "dry_run": True, "title": title}

    if not video_path:
        return {"success": False, "platform": "youtube", "message": "video_path required for YouTube upload"}

    logger.warning("YouTube upload is not yet implemented. Video: %s", video_path)
    return {"success": False, "platform": "youtube", "message": "YouTube upload not implemented in this version"}
