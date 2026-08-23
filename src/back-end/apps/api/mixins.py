import logging
from django import http
from django.contrib.auth.mixins import AccessMixin
from django.conf import settings
from django.db.models import QuerySet
from apps.users.models import User
from apps.constructions import models as constructions_models
from . import responses


class AccountVerificationMixin(AccessMixin):
    """
    - Check if the user is authenticated.
    - Check if the user email is verified.
    - Check if the user email is active.
    """

    login_url = settings.LOGIN_URL

    def dispatch(self, request: http.HttpRequest, *args, **kwargs):
        user: User = request.user

        if not user.is_authenticated:
            return responses.Forbidden(
                request=request,
                data={
                    "detail": "Autenticação necessária.",
                    "code": "not_authenticated",
                },
            )

        if not user.is_email_verified:
            return responses.Forbidden(
                request=request,
                data={
                    "detail": "Email não verificado.",
                    "code": "email_not_verified",
                },
            )

        if not user.is_active:
            logging.warning(f"Deactivated user #{user.id} is trying to login.")
            return responses.Forbidden(
                request=request,
                data={
                    "detail": "Conta desativada.",
                    "code": "account_inactive",
                },
            )

        return super().dispatch(request, *args, **kwargs)


class EmployeePermissionMixin(AccessMixin):
    """
    - Check if emplyee has the contruction permission.
    """

    login_url = settings.LOGIN_URL

    def has_employee_permission(self) -> bool:
        employee = self.get_employee_queryset()
        if employee:
            return True

        return False

    def get_employee_queryset(self) -> constructions_models.Employee:
        return (
            constructions_models.Employee.objects.select_related("construction")
            .filter(id=self.employee_id, user=self.request.user)
            .first()
        )

    def dispatch(self, request: http.HttpRequest, *args, **kwargs):
        self.request = request
        self.employee_id = kwargs.get("employee_id", None)

        if not self.has_employee_permission():
            return responses.Unauthorized(
                request=request,
                data={
                    "detail": "Esse funcionário não tem a permissão necessária.",
                    "code": "access_denied",
                },
            )

        return super().dispatch(request, *args, **kwargs)
