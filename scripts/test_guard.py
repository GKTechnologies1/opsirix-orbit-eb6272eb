"""Guard for browser and database test scripts.

Usage in a test script:
    from test_guard import require_test_org
    ORG = require_test_org("02e9f32a-a1cf-4208-b918-92fc9b5107a3")
    # in the browser: select the company by this exact ID, then call
    # assert_selected(page_value) before any save or submit.

The script exits before doing anything if the ID is not on the approved TEST list.
"""
import json
import sys
from pathlib import Path

_ALLOW = json.loads((Path(__file__).parent / "test-org-allowlist.json").read_text())["organizations"]


def require_test_org(org_id: str) -> str:
    if org_id not in _ALLOW:
        sys.exit(f"REFUSED: {org_id} is not an approved TEST organization. No test was run.")
    return org_id


def assert_selected(selected_id: str, expected_id: str) -> None:
    """Call right before any save/submit with the ID the page actually has selected."""
    require_test_org(expected_id)
    if selected_id != expected_id:
        sys.exit(f"REFUSED: page selected {selected_id}, expected TEST org {expected_id}. Nothing saved.")


if __name__ == "__main__":
    for arg in sys.argv[1:]:
        require_test_org(arg)
        print(f"OK: {arg} = {_ALLOW[arg]}")
