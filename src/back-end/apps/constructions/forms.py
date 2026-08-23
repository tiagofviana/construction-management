import logging

from django import forms
from django.core.exceptions import ValidationError
from django.forms.models import fields_for_model
from django.db.models import QuerySet
from . import models


class RoomMapDataForm(forms.Form):
    """
    This form validation fields dynamically from the Room model, but WITHOUT using ModelForm.Avoiding any activate_unique()/full_clean() that would generate item-specific queries.
    """

    ROOM_FIELDS = [
        "id",
        "position_x",
        "position_y",
        "rotation",
    ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        model_fields = fields_for_model(
            models.Room,
            fields=self.ROOM_FIELDS,
        )

        self.fields.update(model_fields)


class UpdateFloorForm(forms.Form):
    width = forms.IntegerField(required=False)
    height = forms.IntegerField(required=False)
    rooms = forms.JSONField(
        required=True,
        error_messages={
            "required": "Não há cômodos para serem salvos.",
        },
    )

    def __init__(self, *args, floor_id: int, construction: int, **kwargs):
        self.floor_id = floor_id
        self.construction = construction

        super().__init__(*args, **kwargs)

    def clean_width(self):
        width = self.cleaned_data.get("width")

        if not width:
            return None

        if not (200 <= width >= 1000):
            None

        return width

    def clean_height(self):
        height = self.cleaned_data.get("height")

        if not height:
            return None

        if not (200 <= height >= 1000):
            None

        return height

    def clean(self):
        cleaned_data = super().clean()
        rooms = cleaned_data.get("rooms")

        if rooms is None:
            return cleaned_data

        rooms_qs = self.rooms_queryset().values_list("id", flat=True)
        room_ids = [str(item) for item in rooms_qs]

        for item in rooms:
            if not isinstance(item, dict):
                raise ValidationError("Formato dos dados do cômodo inválido.")

            room_id = str(item.get("id", ""))
            if room_id not in room_ids:
                raise ValidationError(
                    "Um dos cômodos que você está tentando alterar não existe ou foi apagado, por favor, recarregue a página."
                )

            data_form = RoomMapDataForm(data=item)
            if not data_form.is_valid():
                logging.warning(f"Errors on save map: {data_form.errors}")
                raise ValidationError(
                    "Um dos cômodo que você está tentando salvar está com os dados inválidos, por favor, recarregue a página."
                )

        return cleaned_data

    def rooms_queryset(self) -> QuerySet[models.Room]:
        return models.Room.objects.filter(
            floor__construction=self.construction,
            floor=self.floor_id,
        )

    def update(self):
        self._update_rooms()
        self._update_floor()

    def _update_floor(self):
        width = self.cleaned_data.get("width")
        height = self.cleaned_data.get("height")

        if width == None or height == None:
            return

        floor = models.Floor.objects.get(id=self.floor_id)
        floor.width = width
        floor.height = height
        floor.save(update_fields=["width", "height"])

    def _update_rooms(self):
        rooms_map = {item["id"]: item for item in self.cleaned_data["rooms"]}
        rooms_qs = self.rooms_queryset()

        for item in rooms_qs:
            room_id_str = str(item.id)

            if room_id_str not in rooms_map:
                continue

            # Assigns the new values
            incoming_data = rooms_map[room_id_str]
            item.position_x = incoming_data["position_x"]
            item.position_y = incoming_data["position_y"]
            item.rotation = incoming_data["rotation"]

        models.Room.objects.bulk_update(
            rooms_qs, fields=["position_x", "position_y", "rotation"]
        )
