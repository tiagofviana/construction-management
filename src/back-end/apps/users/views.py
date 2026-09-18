import logging
from django import http
from django.conf import settings
from django.shortcuts import redirect
from django.contrib.auth import logout
from django.contrib.auth.views import LogoutView as AuthLogoutView


class LogoutView(AuthLogoutView):
    http_method_names = ["get"]
    next_page = settings.LOGIN_URL

    def get(self, request: http.HttpRequest, *args, **kwargs) -> http.HttpResponse:
        logout(request)

        return redirect(self.next_page)
