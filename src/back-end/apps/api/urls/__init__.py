from django.urls import path, re_path, include
from apps.api.responses import NotFound
from . import account, business, maps

urlpatterns = [
    path("account/", include(account)),
    path("employee/", include(business)),
    path("employee/<int:employee_id>/", include(maps)),
]

urlpatterns.append(
    re_path(r".*", lambda request: NotFound()),
)  # this must be the last
