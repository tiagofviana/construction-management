import logging
from django.contrib.auth.mixins import AccessMixin
from django.conf import settings
from apps.users import models as users_models
from . import responses


class AccountVerificationMixin(AccessMixin):
    """
    - Check if the user is authenticated.
    - Check if the user email is verified.
    - Check if the user email is active.
    """

    login_url = settings.LOGIN_URL

    def dispatch(self, request, *args, **kwargs):
        user: users_models.User = request.user

        if not user.is_authenticated:
            return responses.Forbidden(
                {
                    "detail": "Autenticação necessária.",
                    "code": "not_authenticated",
                }
            )

        if not user.is_email_verified:
            return responses.Forbidden(
                {
                    "detail": "Email não verificado.",
                    "code": "email_not_verified",
                }
            )

        if not user.is_active:
            logging.warning(f"Deactivated user #{user.id} is trying to login.")
            return responses.Forbidden(
                {
                    "detail": "Conta desativada.",
                    "code": "account_inactive",
                },
            )

        return super().dispatch(request, *args, **kwargs)
