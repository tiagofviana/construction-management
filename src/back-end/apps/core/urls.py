from django.urls import path
from django.shortcuts import redirect
from . import views

app_name = "core"

urlpatterns = [
    # FAVICONS
    path(
        "favicon.ico",
        lambda request: redirect("/static/core/favicons/favicon.ico"),
    ),
    path(
        "android-chrome-512x512.png",
        lambda request: redirect("/static/core/favicons/android-chrome-512x512.png"),
    ),
    path(
        "android-chrome-192x192.png",
        lambda request: redirect("/static/core/favicons/android-chrome-192x192.png"),
    ),
    path(
        "favicon-32x32.png",
        lambda request: redirect("/static/core/favicons/favicon-32x32.png"),
    ),
    path(
        "favicon-16x16.png",
        lambda request: redirect("/static/core/favicons/favicon-16x16.png"),
    ),
    path(
        "site.webmanifest",
        lambda request: redirect("/static/core/favicons/site.webmanifest"),
    ),
    # Force error to test on production
    path("test/error", lambda x: "FORCED ERROR"),
]
