import json
import logging
import sys
from datetime import datetime, timezone

DEFAULT_FORMAT = "%(asctime)s %(levelname)s %(name)s %(message)s"


def configure_logging(level=None, json_format=False):
    if level is None:
        level = logging.getLevelName(sys.getenv("LOG_LEVEL", "INFO").upper())

    handlers = [logging.StreamHandler(sys.stdout)]
    if json_format:
        formatter = _JsonFormatter()
    else:
        formatter = logging.Formatter(DEFAULT_FORMAT)

    for handler in handlers:
        handler.setFormatter(formatter)

    root = logging.getLogger()
    root.setLevel(level)
    root.handlers = handlers


def get_logger(name):
    return logging.getLogger(name)


class _JsonFormatter(logging.Formatter):
    def format(self, record):
        out = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            out["exception"] = self.formatException(record.exc_info)
        return json.dumps(out, default=str)
