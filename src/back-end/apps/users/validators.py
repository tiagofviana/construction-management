import logging
from django import http
from django.conf import settings
from django.core.cache import cache
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from apps.core import utils as core_utils
from . import models


class PasswordReset:
    # Class used validate the request is a valid password reset
    def __init__(self, request: http.HttpRequest):
        self.request = request
        self.uidb64 = request.resolver_match.kwargs.get("uidb64")
        self.token = request.resolver_match.kwargs.get("token")

    @staticmethod
    def get_cache_key(user: models.User):
        return f"password-reset-request:{user.id}"

    @property
    def user(self) -> models.User | None:
        user = getattr(self, "_user", None)
        if user:
            return user

        if self.uidb64 == None:
            return None

        try:
            uid = force_str(urlsafe_base64_decode(self.uidb64))
            self._user = models.User.objects.get(id=uid)
            return self._user
        except Exception:
            ip = core_utils.get_client_ip(self.request)
            logging.warning(f'Password reset invalid uid. Client ip: "{ip}".')
            return None

    def is_valid(self):
        if self.user is None:
            return False

        if self.token is None:
            return False

        key = PasswordReset.get_cache_key(self.user)
        if cache.get(key) != 0:
            return False

        is_token_valid = PasswordResetTokenGenerator().check_token(
            self.user, self.token
        )
        if not is_token_valid:
            ip = core_utils.get_client_ip(self.request)
            logging.warning(f'Password reset invalid token. Client ip: "{ip}".')
            return False

        return True
