"""
Doppler secrets store wrapper.
Writes credentials to Doppler after each account is created.
"""

from __future__ import annotations
from typing import Any


class DopplerStore:
    """Stores secrets in a Doppler project."""

    def __init__(self, master_project: str) -> None:
        self._project = master_project

    def bootstrap_token(self, token: str) -> None:
        """Store the initial DOPPLER_TOKEN from account creation."""
        self.set_many({"DOPPLER_TOKEN": token})

    def set_many(self, secrets: dict[str, str]) -> None:
        """Write a batch of secrets to Doppler."""
        if not secrets:
            return
        # TODO: implement doppler CLI or API call
        print(f"  [doppler] would store {len(secrets)} secret(s) to {self._project}/prod")

    def list_keys(self) -> list[str]:
        """Return all known secret keys (stub)."""
        return ["DOPPLER_TOKEN"]
