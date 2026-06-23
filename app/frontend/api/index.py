"""Vercel serverless entry — re-exports FastAPI app from app/backend."""

import logging
import os
import sys

# Vercel: no local log files; use stdout only
os.environ.setdefault("VERCEL", "1")

_BACKEND_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend"))
if _BACKEND_ROOT not in sys.path:
    sys.path.insert(0, _BACKEND_ROOT)

os.chdir(_BACKEND_ROOT)

from main import app  # noqa: E402

logger = logging.getLogger(__name__)
logger.info("Vercel ASGI: backend root=%s", _BACKEND_ROOT)
