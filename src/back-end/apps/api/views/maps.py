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
        employee = self.get_employee_queryset()
        if not employee.has_permission("can_view_floor"):
            return responses.Forbidden(
                request=self.request,
                data={
                    "detail": "O usuário não possui a permissão necessária.",
                    "code": "can_not_view_map",
                },
            )

        data = self.get_floors()
        return responses.Success(data, safe=False)

    def has_employee_permission(self):
        return super().has_employee_permission()

    def get_floor_queryset(self) -> QuerySet[maps_models.Floor]:
        employee = self.get_employee_queryset()
        construction = employee.construction

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
        if not self.is_valid_room():
            return responses.NotFound()

        employee = self.get_employee_queryset()
        if not employee.has_permission("can_view_floor"):
            return responses.Forbidden(
                request=self.request,
                data={
                    "detail": "O usuário não possui a permissão necessária.",
                    "code": "can_not_view_map",
                },
            )

        data = {
            "rooms": self.get_rooms(),
            "floorSettings": self.get_floor_settings(),
        }
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

    def is_valid_room(self) -> bool:
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

        if not self.has_access():
            return responses.Forbidden(
                request=self.request,
                data={
                    "detail": "O usuário não possui a permissão necessária.",
                    "code": "can_not_edit_map",
                },
            )
        return super().post(request, *args, **kwargs)

    def has_access(self):
        employee = self.get_employee_queryset()

        exists = maps_models.Floor.objects.filter(
            construction=employee.construction, id=self.floor_id
        ).exists()

        if not exists:
            return False

        if not employee.has_permission("can_edit_floor"):
            return False

        return True

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs["data"] = self.request.POST
        kwargs["construction"] = self.get_employee_queryset().construction
        kwargs["floor_id"] = self.floor_id
        return kwargs

    def form_valid(self, form: maps_forms.UpdateFloorForm) -> http.JsonResponse:
        form.update()
        user = self.request.user
        floor_id = self.kwargs["floor_id"]
        logging.info(f"User #{user.id}. Changed the Floor #{floor_id}.")
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
        self.floor_id = request.POST.get("floor", None)

        if not self.has_access():
            return responses.Forbidden(
                request=self.request,
                data={
                    "detail": "O usuário não possui a permissão necessária.",
                    "code": "can_not_edit_map",
                },
            )

        return super().post(request, *args, **kwargs)

    def has_access(self):
        employee = self.get_employee_queryset()

        if not self.floor_id:
            return False

        exists = maps_models.Floor.objects.filter(
            construction=employee.construction, id=self.floor_id
        ).exists()

        if not exists:
            return False

        if not employee.has_permission("can_edit_floor"):
            return False

        return True

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

    def post(self, request, *args, **kwargs):
        if not self.has_access():
            return responses.Forbidden(
                request=self.request,
                data={
                    "detail": "O usuário não possui a permissão necessária.",
                    "code": "can_not_edit_room",
                },
            )

        return super().post(request, *args, **kwargs)

    def get_queryset(self):
        construction = self.get_employee_queryset().construction
        return maps_models.Room.objects.filter(floor__construction=construction)

    def has_access(self):
        employee = self.get_employee_queryset()
        if not employee.has_permission("can_edit_room"):
            return False

        return True

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
