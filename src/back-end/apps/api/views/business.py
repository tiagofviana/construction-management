import logging, hashlib
from django import http
from django.conf import settings
from django.core.cache import cache
from django.db.models import Count, QuerySet, F
from django.views import View
from django.views.generic import CreateView, FormView, UpdateView
from apps.users.models import User
from apps.maps import forms as maps_forms
from apps.business import models as business_models
from apps.maps import models as maps_models
from apps.api import responses
from .. import mixins


class ConstructionsListView(mixins.AccountVerificationMixin, View):
    http_method_names = ["get"]

    def get(self, *args, **kwargs) -> http.JsonResponse:
        data = self.get_contructions()
        return responses.Success(data, safe=False)

    def get_queryset(self) -> QuerySet[business_models.Employee]:
        user: User = self.request.user
        return business_models.Employee.objects.filter(
            user=user, is_active=True
        ).select_related("construction")

    def get_contructions(self) -> list:
        employees = self.get_queryset()
        data = list()

        for item in employees:
            construction = item.construction
            photo_url = ""

            if construction.photo:
                photo_url = f"/media/{construction.photo}"

            data.append(
                {
                    "employeeId": item.id,
                    "name": construction.name,
                    "address": construction.address,
                    "photoUrl": photo_url,
                }
            )

        return data


class DashboardDataView(
    mixins.AccountVerificationMixin, mixins.EmployeePermissionMixin, View
):
    http_method_names = ["get"]

    def get(self, *args, **kwargs) -> http.JsonResponse:
        data = {
            "construction": self.construction_data(),
            "atlas": self.atlas_data(),
        }

        return responses.Success(data, safe=False)

    def construction_data(self) -> dict:
        employee = self.get_employee_queryset()
        construction = employee.construction
        photo_url = ""

        if construction.photo:
            photo_url = f"/media/{construction.photo}"

        return {
            "name": construction.name,
            "address": construction.address,
            "photoUrl": photo_url,
        }

    def atlas_data(self) -> list:
        employee = self.get_employee_queryset()
        construction = employee.construction
        has_permission = employee.has_permission("can_view_floor", use_cache=False)
        result = []

        if has_permission:
            result = list(
                maps_models.Floor.objects.filter(construction=construction)
                .annotate(roomCount=Count("room"))
                .values("name", "roomCount")
                .order_by("order")
            )

        return result


class PermissionsDataView(
    mixins.AccountVerificationMixin, mixins.EmployeePermissionMixin, View
):
    http_method_names = ["get"]

    def get(self, *args, **kwargs) -> http.JsonResponse:
        employee = self.get_employee_queryset()
        data = {"permissions": []}

        if not employee.is_admin:
            data["permissions"] = employee.get_all_permissions()
        else:
            data["permissions"] = [
                {
                    "codename": "is_admin",
                    "name": "É administrador",
                }
            ]

        return responses.Success(data, safe=False)
