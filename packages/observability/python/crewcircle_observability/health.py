import os
from datetime import datetime, timezone


def health_router(app_name):
    started_at = datetime.now(timezone.utc).isoformat()

    async def handler(request):
        return {
            "status": "ok",
            "app": app_name,
            "version": os.getenv("APP_VERSION", "unknown"),
            "started_at": started_at,
            "checked_at": datetime.now(timezone.utc).isoformat(),
        }

    return handler
