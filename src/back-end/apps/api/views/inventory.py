import logging
from django import http
from django.conf import settings
from django.core.cache import cache
from django.db.models import QuerySet, F, Value, TextField
from django.db.models.functions import Coalesce, NullIf
from django.views import View
from django.views.generic import FormView
from apps.users.models import User
from apps.inventory import models as inventory_models
from apps.inventory import forms as inventory_forms
from apps.maps import models as maps_models
from apps.api import responses
from .. import mixins


class CategoryListView(
    mixins.AccountVerificationMixin, mixins.EmployeePermissionMixin, View
):
    http_method_names = ["get"]

    def get(self, *args, **kwargs) -> http.JsonResponse:
        data = self.get_categories()
        return responses.Success(data, safe=False)

    def get_categories(self) -> list:
        categories = inventory_models.Category.objects.order_by("name").values(
            "id", "name"
        )
        return list(categories)


class RoomInventoryDataView(
    mixins.AccountVerificationMixin, mixins.EmployeePermissionMixin, View
):
    http_method_names = ["get"]

    def get(self, *args, **kwargs) -> http.JsonResponse:
        if not self.is_valid_room():
            return responses.NotFound()

        employee = self.get_employee_queryset()
        if not employee.has_permission("can_view_roomItem"):
            return responses.Forbidden(
                request=self.request,
                data={
                    "detail": "O usuário não possui a permissão necessária.",
                    "code": "can_not_view_room_item",
                },
            )

        data = {
            "room": self.get_room(),
            "items": self.get_room_items(),
        }
        return responses.Success(data, safe=False)

    def get_room(self) -> dict:
        construction = self.get_employee_queryset().construction
        room_id = self.kwargs.get("room_id", None)

        return (
            maps_models.Room.objects.filter(
                id=room_id, floor__construction=construction
            )
            .annotate(
                svgPath=F("svg_path"),
                svgViewBox=F("svg_view_box"),
            )
            .values(
                "id",
                "name",
                "description",
                "area",
                "svgPath",
                "svgViewBox",
                "color",
            )
            .get()
        )

    def is_valid_room(self) -> bool:
        construction = self.get_employee_queryset().construction
        room_id = self.kwargs.get("room_id", None)

        return maps_models.Room.objects.filter(
            id=room_id, floor__construction=construction
        ).exists()

    def get_room_items_queryset(self) -> QuerySet[inventory_models.RoomItem]:
        construction = self.get_employee_queryset().construction
        room_id = self.kwargs.get("room_id", None)

        return inventory_models.RoomItem.objects.filter(
            room__floor__construction=construction, room=room_id
        ).order_by("item__category__name", "item__name")

    def get_room_items(self) -> list:
        data = (
            self.get_room_items_queryset()
            .annotate(
                name=F("item__name"),
                description=F("item__description"),
                svg=Coalesce(
                    NullIf(F("item__svg"), Value(""), output_field=TextField()),
                    F("item__category__svg"),
                    output_field=TextField(),
                ),
                categoryId=F("item__category_id"),
                positionX=F("position_x"),
                positionY=F("position_y"),
            )
            .values(
                "id",
                "name",
                "description",
                "svg",
                "categoryId",
                "positionX",
                "positionY",
                "rotation",
            )
        )
        return list(data)


class UpdateRoomInventoryFormView(
    mixins.AccountVerificationMixin,
    mixins.EmployeePermissionMixin,
    FormView,
):
    http_method_names = ["post"]
    form_class = inventory_forms.UpdateRoomInventoryForm

    def post(self, request: http.HttpRequest, *args, **kwargs):
        self.room_id = kwargs.get("room_id", None)

        if not self.has_access():
            return responses.Forbidden(
                request=self.request,
                data={
                    "detail": "O usuário não possui a permissão necessária.",
                    "code": "can_not_edit_room_item",
                },
            )
        return super().post(request, *args, **kwargs)

    def has_access(self) -> bool:
        employee = self.get_employee_queryset()

        exists = maps_models.Room.objects.filter(
            floor__construction=employee.construction, id=self.room_id
        ).exists()

        if not exists:
            return False

        return employee.has_permission("can_edit_roomItem")

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs["data"] = self.request.POST
        kwargs["construction"] = self.get_employee_queryset().construction
        kwargs["room_id"] = self.room_id
        return kwargs

    def form_valid(
        self, form: inventory_forms.UpdateRoomInventoryForm
    ) -> http.JsonResponse:
        form.update()
        user = self.request.user
        logging.info(f"User #{user.id}. Changed the inventory of the Room #{self.room_id}.")
        return responses.Success()

    def form_invalid(
        self, form: inventory_forms.UpdateRoomInventoryForm
    ) -> http.JsonResponse:
        return responses.Error(form.errors)
