"""Local development server with quieter console logging."""

import logging
import os
import sys


def quiet_noisy_loggers() -> None:
    """Reduce SQL/driver noise in local dev terminals."""
    level_name = os.environ.get("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)

    root = logging.getLogger()
    root.setLevel(level)
    for handler in root.handlers:
        handler.setLevel(level)

    for name in (
        "aiosqlite",
        "sqlalchemy.engine",
        "sqlalchemy.pool",
        "sqlalchemy.orm",
        "httpx",
        "httpcore",
        "uvicorn.access",
    ):
        logging.getLogger(name).setLevel(logging.WARNING)

    logging.getLogger("uvicorn").setLevel(level)
    logging.getLogger("uvicorn.error").setLevel(level)
    logging.getLogger("fastapi").setLevel(level)


def main() -> None:
    from main import app, run_in_debug_mode  # noqa: WPS433 — triggers main.setup_logging
    from core.config import settings

    quiet_noisy_loggers()

    is_debugging = "pydevd" in sys.modules or (
        hasattr(sys, "gettrace") and sys.gettrace() is not None
    )

    import uvicorn

    if is_debugging:
        run_in_debug_mode(app)
        return

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(settings.port),
        reload_excludes=["**/*.py"],
        log_level=os.environ.get("LOG_LEVEL", "info").lower(),
    )


if __name__ == "__main__":
    main()
