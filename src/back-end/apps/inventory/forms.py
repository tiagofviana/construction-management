from django import forms
from django.core.exceptions import ValidationError
from . import models

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
