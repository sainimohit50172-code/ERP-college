import logging
import sys
from typing import Optional

from app.core.config import get_settings

settings = get_settings()


def configure_logging() -> logging.Logger:
    logging.basicConfig(
        level=getattr(logging, settings.log_level.upper(), logging.INFO),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )
    return logging.getLogger("college_erp")


logger = configure_logging()
