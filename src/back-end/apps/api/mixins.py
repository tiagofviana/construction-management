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

    @property
    def employeeId(self) -> str:
        return self.request.POST.get("employeeId", "")

    def has_employee_permission(self) -> bool:
        if not self.employeeId:
            return False

        return constructions_models.Employee.objects.filter(
            id=self.employeeId,
        ).exists()

    def get_contruction_queryset(self) -> QuerySet[constructions_models.Construction]:
        return (
            constructions_models.Employee.objects.select_related("construction")
            .get(id=self.employeeId)
            .construction
        )

    def dispatch(self, request: http.HttpRequest, *args, **kwargs):
        self.request = request

        if not self.has_employee_permission():
            return responses.Unauthorized(
                request=request,
                data={
                    "detail": "Esse funcionário não tem a permissão necessária.",
                    "code": "access_denied",
                },
            )

        return super().dispatch(request, *args, **kwargs)
