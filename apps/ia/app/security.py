"""Small security helpers for the IA service."""

import secrets


def is_valid_bearer_token(
    authorization: str | None,
    expected_token: str | None,
) -> bool:
    """Return True only for an exact Bearer token when a secret is configured."""
    if not expected_token or not authorization:
        return False

    scheme, separator, supplied_token = authorization.partition(" ")
    if separator != " " or scheme.lower() != "bearer" or not supplied_token:
        return False

    return secrets.compare_digest(supplied_token, expected_token)
