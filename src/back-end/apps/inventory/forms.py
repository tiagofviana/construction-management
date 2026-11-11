import logging
from django import forms
from django.core.exceptions import ValidationError
from django.db.models import QuerySet
from . import models, validators

ATTRIBUTES_PREFIX = "attributes."


class ItemAdminForm(forms.ModelForm):
    """
    Remaps the "attributes.<name>" errors raised by RoomObjectValidator to the
    "attributes" form field, since the admin form has no field for each key.
    """

    class Meta:
        model = models.Item
        fields = "__all__"

    def _get_attribute_labels(self) -> dict[str, str]:
        if not self.instance.category_id:
            return {}

        return {
            attribute.name: attribute.label
            for attribute in self.instance.category.attributes.all()
        }

    def _update_errors(self, errors):
        if not hasattr(errors, "error_dict"):
            return super()._update_errors(errors)

        labels = None
        error_dict = {}

        for key, error_list in errors.error_dict.items():
            if not key.startswith(ATTRIBUTES_PREFIX):
                error_dict.setdefault(key, []).extend(error_list)
                continue

            if labels is None:
                labels = self._get_attribute_labels()

            name = key[len(ATTRIBUTES_PREFIX) :]
            label = labels.get(name, name)

            for message in ValidationError(error_list).messages:
                error_dict.setdefault("attributes", []).append(
                    ValidationError(f"{label}: {message}")
                )

        super()._update_errors(ValidationError(error_dict))


class RoomItemMapDataForm(forms.Form):
    """
    Validates the map data of one room item (position and rotation), without
    using a ModelForm to avoid item-specific queries.
    """

    id = forms.UUIDField()
    position_x = forms.FloatField(validators=[validators.validate_position])
    position_y = forms.FloatField(validators=[validators.validate_position])
    rotation = forms.FloatField(validators=[validators.validate_rotation])


class UpdateRoomInventoryForm(forms.Form):
    items = forms.JSONField(
        required=True,
        error_messages={
            "required": "Não há itens para serem salvos.",
        },
    )

    def __init__(self, *args, room_id, construction, **kwargs):
        self.room_id = room_id
        self.construction = construction

        super().__init__(*args, **kwargs)

    def clean_items(self) -> dict:
        items = self.cleaned_data.get("items")

        if not isinstance(items, list) or len(items) == 0:
            raise ValidationError("Não há itens para serem salvos.")

        item_ids = {
            str(item_id)
            for item_id in self.room_items_queryset().values_list("id", flat=True)
        }
        items_map = {}

        for item in items:
            if not isinstance(item, dict):
                raise ValidationError("Formato dos dados do item inválido.")

            data_form = RoomItemMapDataForm(data=item)
            if not data_form.is_valid():
                logging.warning(f"Errors on save room inventory: {data_form.errors}")
                raise ValidationError(
                    "Um dos itens que você está tentando salvar está com os dados inválidos, por favor, recarregue a página."
                )

            item_id = str(data_form.cleaned_data["id"])
            if item_id not in item_ids:
                raise ValidationError(
                    "Um dos itens que você está tentando alterar não existe ou foi removido, por favor, recarregue a página."
                )

            items_map[item_id] = data_form.cleaned_data

        return items_map

    def room_items_queryset(self) -> QuerySet[models.RoomItem]:
        return models.RoomItem.objects.filter(
            room__floor__construction=self.construction,
            room=self.room_id,
        )

    def update(self):
        items_map = self.cleaned_data["items"]
        room_items = list(self.room_items_queryset().filter(id__in=items_map.keys()))

        for room_item in room_items:
            incoming_data = items_map[str(room_item.id)]
            room_item.position_x = incoming_data["position_x"]
            room_item.position_y = incoming_data["position_y"]
            room_item.rotation = incoming_data["rotation"]

        models.RoomItem.objects.bulk_update(
            room_items, fields=["position_x", "position_y", "rotation"]
        )
