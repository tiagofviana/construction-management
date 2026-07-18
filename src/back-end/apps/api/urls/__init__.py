from django.urls import path, re_path, include
from apps.api.responses import NotFound
from . import account, employee

urlpatterns = [
    path("account/", include(account)),
    path("employee/", include(employee)),
]

urlpatterns.append(
    re_path(r".*", lambda request: NotFound()),
)  # this must be the last
