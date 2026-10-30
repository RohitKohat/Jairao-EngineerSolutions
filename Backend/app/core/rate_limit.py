from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request


# Rate limiter using client's IP address
limiter = Limiter(key_func=get_remote_address)


def get_client_ip(request: Request) -> str:
    """Get real client IP (handles proxies)."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return get_remote_address(request)