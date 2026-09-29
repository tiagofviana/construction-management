import logging
from django import forms
from django.db import transaction
from . import models


class SaveGroupForm(forms.ModelForm):
    class Meta:
        model = models.ConstructionGroup
        fields = ["name", "permissions"]

    def __init__(self, construction: models.Construction, *args, **kwargs):
        self.construction = construction
        super().__init__(*args, **kwargs)

    def clean(self):
        cleaned_data = super().clean()
        name = cleaned_data.get("name")

        if self.construction and name:
            qs = models.ConstructionGroup.objects.filter(
                construction=self.construction, name=name
            )
            if self.instance.pk:
                qs = qs.exclude(pk=self.instance.pk)

            if qs.exists():
                self.add_error(
                    "name", "Já existe um grupo com este nome para esta construção."
                )

        return cleaned_data

    def save(self, commit=True) -> models.ConstructionGroup:
        instance: models.ConstructionGroup = super().save(commit=False)
        instance.construction = self.construction

        if commit:
            with transaction.atomic():
                instance.save()
                self.save_m2m()

        return instance
