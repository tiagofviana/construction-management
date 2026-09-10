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


class FloorListView(
    mixins.AccountVerificationMixin,
    mixins.EmployeePermissionMixin,
    View,
):
    http_method_names = ["get"]

    def get(self, *args, **kwargs) -> http.JsonResponse:
        data = self.get_floors()
        return responses.Success(data, safe=False)

    def get_floor_queryset(self) -> QuerySet[maps_models.Floor]:
        construction = self.get_employee_queryset().construction

        return maps_models.Floor.objects.filter(construction=construction).order_by(
            "order"
        )

    def get_floors(self) -> list:
        floors = self.get_floor_queryset().values("id", "name")
        return list(floors)


class FloorDataView(
    mixins.AccountVerificationMixin,
    mixins.EmployeePermissionMixin,
    View,
):
    http_method_names = ["get"]

    def get(self, *args, **kwargs) -> http.JsonResponse:
        if not self.is_valid():
            return responses.NotFound()

        data = {"rooms": self.get_rooms(), "floorSettings": self.get_floor_settings()}
        return responses.Success(data, safe=False)

    def get_floor_settings(self):
        floor_id = self.kwargs.get("floor_id", None)
        return maps_models.Floor.objects.values("width", "height").get(id=floor_id)

    def get_rooms_queryset(self) -> QuerySet[maps_models.Room]:
        construction = self.get_employee_queryset().construction
        floor_id = self.kwargs.get("floor_id", None)
        return maps_models.Room.objects.filter(
            floor__construction=construction, floor=floor_id
        )

    def is_valid(self) -> bool:
        floor_id = self.kwargs.get("floor_id", None)
        return maps_models.Floor.objects.filter(id=floor_id).exists()

    def get_rooms(self) -> list:
        data = (
            self.get_rooms_queryset()
            .annotate(
                svgPath=F("svg_path"),
                svgViewBox=F("svg_view_box"),
                positionX=F("position_x"),
                positionY=F("position_y"),
            )
            .values(
                "id",
                "name",
                "description",
                "area",
                "svgPath",
                "svgViewBox",
                "color",
                "positionX",
                "positionY",
                "rotation",
            )
        )
        return list(data)


class UpdateFloorFormView(
    mixins.AccountVerificationMixin,
    mixins.EmployeePermissionMixin,
    FormView,
):
    http_method_names = ["post"]
    form_class = maps_forms.UpdateFloorForm

    def post(self, request: http.HttpRequest, *args, **kwargs):
        self.floor_id = kwargs.get("floor_id", None)
        return super().post(request, *args, **kwargs)

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs["data"] = self.request.POST
        kwargs["construction"] = self.get_employee_queryset().construction
        kwargs["floor_id"] = self.floor_id
        return kwargs

    def form_valid(self, form: maps_forms.UpdateFloorForm) -> http.JsonResponse:
        form.update()
        return responses.Success(safe=False)

    def form_invalid(self, form: maps_forms.UpdateFloorForm) -> http.JsonResponse:
        return responses.Error(form.errors)


class RoomCreateView(
    mixins.AccountVerificationMixin,
    mixins.EmployeePermissionMixin,
    CreateView,
):
    model = maps_models.Room
    fields = [
        "floor",
        "svg_path",
        "name",
        "description",
        "area",
        "color",
    ]
    http_method_names = ["post"]

    def post(self, request, *args, **kwargs):
        construction = self.get_employee_queryset().construction
        floor_id = request.POST.get("floor", None)

        has_permission = maps_models.Floor.objects.filter(
            construction=construction, id=floor_id
        ).exists()

        if not has_permission:
            return responses.Unauthorized(
                request=request,
                data={
                    "detail": "Esse funcionário não tem a permissão necessária.",
                    "code": "access_denied",
                },
            )

        return super().post(request, *args, **kwargs)

    def form_invalid(self, form):
        return responses.Error(form.errors)

    def form_valid(self, form):
        form.save()
        return responses.Success()

    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        form.fields["svg_path"].error_messages[
            "required"
        ] = "Falta inserir o desenho do cômodo."
        return form


class RoomUpdateView(
    mixins.AccountVerificationMixin,
    mixins.EmployeePermissionMixin,
    UpdateView,
):
    model = maps_models.Room
    pk_url_kwarg = "room_id"
    fields = [
        "svg_path",
        "name",
        "description",
        "area",
        "color",
    ]
    http_method_names = ["post"]

    def get_queryset(self):
        construction = self.get_employee_queryset().construction
        return maps_models.Room.objects.filter(floor__construction=construction)

    def form_invalid(self, form):
        return responses.Error(form.errors)

    def form_valid(self, form):
        self.object = form.save()
        return responses.Success()

    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        form.fields["svg_path"].error_messages[
            "required"
        ] = "Falta inserir o desenho do cômodo."
        return form
