import uuid
from PIL import Image
from django.apps import apps
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.fields.files import ImageFieldFile
from django.utils.deconstruct import deconstructible
from . import widgets, utils


class CustomImageField(models.ImageField):
    _formats = ("WEBP",)

    error_messages = {
        "invalid_height": "A altura da imagem é %(current_height)s, espera-se econtrar%(expected_height)spx",
        "invalid_width": "A largura da imagem é %(current_width)spx, espera-se econtrar %(expected_width)spx.",
        "invalid_format": f"Formato inválido. Formatos suportados: {', '.join(_formats)}",
        "invalid_image": "O arquivo enviado não era uma imagem ou era estava corrompido",
    }

    def __init__(self, subdir: str, width: int, height: int, *args, **kwargs):
        self.width = width
        self.height = height
        self._subdir = subdir
        kwargs["upload_to"] = utils.PathAndRename(subdir)
        super().__init__(*args, **kwargs)

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        kwargs["subdir"] = self._subdir
        kwargs["width"] = self.width
        kwargs["height"] = self.height
        return name, path, args, kwargs

    def validate(self, value: ImageFieldFile, model_instance: models.Model):
        # Verify image
        try:
            image = Image.open(value)
            image.verify()
        except Exception:
            raise ValidationError(
                self.error_messages["invalid_image"], code="invalid_image"
            )

        # Validate format
        if image.format not in self._formats:
            raise ValidationError(
                self.error_messages["invalid_format"], code="invalid_format"
            )

        # Validate height
        if value.height != self.height:
            raise ValidationError(
                self.error_messages["invalid_height"],
                code="invalid_height",
                params={
                    "expected_height": self.height,
                    "current_height": value.height,
                },
            )

        # Validate width
        if value.width != self.width:
            raise ValidationError(
                self.error_messages["invalid_width"],
                code="invalid_width",
                params={
                    "expected_width": self.width,
                    "current_width": value.width,
                },
            )

        return super().validate(value, model_instance)

    def pre_save(self, model_instance: models.Model, add: bool):
        if add is True:
            return super().pre_save(model_instance, add)

        old_model = model_instance.__class__.objects.filter(
            pk=model_instance.pk
        ).first()

        if not old_model:
            return super().pre_save(model_instance, add)

        old_url = self._get_image_url(old_model)
        current_url = self._get_image_url(model_instance)

        if old_url != current_url:
            self.delete_file(old_model)

        return super().pre_save(model_instance, add)

    def _get_image_url(self, instance: models.Model) -> str:
        try:
            return getattr(instance, self.attname).url
        except ValueError:
            # Empty file
            return ""

    def delete_file(self, instance: models.Model):
        deleter = utils.CustomImageFieldDeleter(self.attname, instance=instance)
        deleter.start()

    def formfield(self, **kwargs):
        kwargs["widget"] = widgets.ImageCropperInputWidget(
            attrs={
                "accept": "image/webp",
                "height": self.height,
                "width": self.width,
            }
        )
        return super().formfield(**kwargs)


@deconstructible
class UniqueUUIDGenerator:
    def __init__(
        self, app_label: str, model_name: str, field_name="id", uuid_func=uuid.uuid1
    ):
        self.field_name = field_name
        self.app_label = app_label
        self.model_name = model_name
        self.uuid_func = uuid_func

    def _get_model(self):
        try:
            return apps.get_model(self.app_label, self.model_name)
        except LookupError:
            raise RuntimeError(
                f'Could not found model "{self.app_label}.{self.model_name}" on UUID generator.'
            )

    def __call__(self):
        model = self._get_model()
        identifier = self.uuid_func()

        # Ensure uniqueness
        while model.objects.filter(**{self.field_name: identifier}).exists():
            identifier = self.uuid_func()

        return identifier

    def __eq__(self, other):
        return isinstance(other, UniqueUUIDGenerator) and (
            self.app_label,
            self.model_name,
            self.field_name,
            self.uuid_func,
        ) == (
            other.app_label,
            other.model_name,
            other.field_name,
            self.uuid_func,
        )
