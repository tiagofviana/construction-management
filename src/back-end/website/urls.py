from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.shortcuts import redirect
from django.urls import path, include

urlpatterns = [
    path("z/login/", lambda request: redirect(settings.LOGIN_URL)),
    path("z/", admin.site.urls),
    path("", include("apps.core.urls")),
    path("", include("apps.users.urls")),
    path("api/", include("apps.api.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns.append(path("", include("apps.spa.urls")))
