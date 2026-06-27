import os, sys

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
    },
}
