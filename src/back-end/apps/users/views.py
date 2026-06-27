import logging
from django import http
from django.conf import settings
from django.core.cache import cache
from django.shortcuts import redirect
from django.views.generic.edit import FormView
from django.contrib.auth import logout
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth.views import LogoutView as AuthLogoutView
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.views.generic.edit import FormView
from . import forms, models


class LogoutView(AuthLogoutView):
    http_method_names = ["get"]
    next_page = settings.LOGIN_URL

    def get(self, request: http.HttpRequest, *args, **kwargs) -> http.HttpResponse:
        logout(request)

        return redirect(self.next_page)


class PasswordResetView(FormView):
    form_class = forms.PasswordResetForm
    template_name = "users/password-reset.html"
    success_url = "/confirmar?redirect=/login&message=Senha+alterada+com+sucesso."

    def dispatch(self, request: http.HttpRequest, *args, **kwargs):
        if not self._is_valid():
            raise http.Http404()

        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form: forms.PasswordResetForm):
        user = self._get_user_by_uidb64()
        form.save(user)
        key = self._get_cache_key(user)
        cache.set(key=key, value=True, timeout=1)
        return super().form_valid(form)

    def _get_cache_key(self, user: models.User):
        return f"password-reset-request:{user.id}"

    def _get_user_by_uidb64(self) -> models.User | None:
        uidb64 = self.kwargs.get("uidb64")
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            return models.User.objects.get(id=uid)
        except Exception:
            logging.warning(
                f"Password reset: invalid uid. Remote address: {self.request.META['REMOTE_ADDR']}"
            )
            return None

    def _is_valid(self) -> bool:
        user = self._get_user_by_uidb64()

        if user is None:
            return False

        key = self._get_cache_key(user)
        if cache.get(key=key) is None:
            logging.warning(
                f"Password reset: invalid cache. Remote address: {self.request.META['REMOTE_ADDR']}"
            )
            return False

        token = self.kwargs.get("token")
        is_token_valid = PasswordResetTokenGenerator().check_token(user, token)
        if not is_token_valid:
            logging.warning(
                f"Password reset: invalid token. Remote address: {self.request.META['REMOTE_ADDR']}"
            )

        return is_token_valid
