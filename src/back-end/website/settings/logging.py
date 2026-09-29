import os, sys
from logging import Filter


class SkipStaticFilter(Filter):
    """Logging filter to skip logging of staticfiles"""

    def filter(self, record):
        message = record.getMessage()
        # Ignora se contiver requisições para /static/ ou /media/
        if "/static/" in message or "/media/" in message:
            return False
        return True


LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        # It only works in production and stage
        "require_debug_false": {
            "()": "django.utils.log.RequireDebugFalse",
        },
        "require_debug_true": {
            "()": "django.utils.log.RequireDebugTrue",
        },
        "hide_staticfiles": {
            "()": SkipStaticFilter,
        },
    },
    "formatters": {
        "simple": {
            "format": "[{asctime}] [{levelname}: {name}] - {message}",
            "datefmt": "%d/%B/%Y %H:%M:%S",
            "style": "{",
        }
    },
    "handlers": {
        "mail_admins": {
            "level": "ERROR",
            "filters": ["require_debug_false"],
            "class": "django.utils.log.AdminEmailHandler",
            "include_html": True,
        },
        "console": {
            "filters": ["hide_staticfiles"],
            "class": "logging.StreamHandler",
            "formatter": "simple",
            "stream": sys.stderr,
        },
    },
    "loggers": {
        "root": {
            "handlers": ["mail_admins"],
            "level": "ERROR",
            "propagate": True,
        },
        "": {
            "handlers": ["console"],
            "level": os.environ.get("DJANGO_LOG_LEVEL", "INFO"),
            "propagate": True,
        },
        "django.server": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}
