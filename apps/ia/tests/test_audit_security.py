from app.security import is_valid_bearer_token


def test_accepts_correct_bearer_token():
    assert is_valid_bearer_token("Bearer test-secret", "test-secret")


def test_rejects_wrong_token():
    assert not is_valid_bearer_token("Bearer wrong-secret", "test-secret")


def test_rejects_missing_authorization():
    assert not is_valid_bearer_token(None, "test-secret")


def test_rejects_missing_configured_secret():
    assert not is_valid_bearer_token("Bearer test-secret", None)


def test_rejects_wrong_scheme():
    assert not is_valid_bearer_token("Basic test-secret", "test-secret")


def test_rejects_token_with_extra_content():
    assert not is_valid_bearer_token("Bearer test-secret extra", "test-secret")
