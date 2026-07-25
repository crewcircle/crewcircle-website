"""
Progress tracker for account-setup.
Saves/resumes progress so the setup can be restarted after failure.
"""

from __future__ import annotations
import json
from pathlib import Path
from typing import Any


class Progress:
    """Tracks completed accounts so they are skipped on re-run."""

    def __init__(self, path: str = ".setup_progress.json") -> None:
        self._path = Path(path)
        if self._path.exists():
            self._data: dict = json.loads(self._path.read_text())
        else:
            self._data = {"completed": {}}

    def done(self, account: str) -> bool:
        return account in self._data.get("completed", {})

    def mark_done(self, account: str, result: dict[str, Any]) -> None:
        self._data.setdefault("completed", {})[account] = result
        self._save()

    def get_meta(self, account: str) -> dict[str, Any]:
        return self._data.get("completed", {}).get(account, {})

    def reset(self, account: str) -> None:
        self._data.get("completed", {}).pop(account, None)
        self._save()

    def _save(self) -> None:
        self._path.write_text(json.dumps(self._data, indent=2, default=str))
