"""
Human-in-the-loop pause points.
Prompts the user to perform a manual action (e.g. DNS change, ID verification)
and waits for them to press ENTER before continuing.
"""

from __future__ import annotations


def pause(message: str) -> None:
    """Print a message and wait for the user to press ENTER."""
    print(message)
    input()
