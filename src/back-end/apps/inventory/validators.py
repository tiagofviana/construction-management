from __future__ import annotations
from typing import TYPE_CHECKING
from django.core.exceptions import ValidationError
from django.db.models import QuerySet

if TYPE_CHECKING:
    from .models import Attribute, RoomObject


def validate_position(value):
    if value < 0:
        raise ValidationError("A posição deve ser maior ou igual a 0.")


def validate_rotation(value):
    if value < 0 or value > 360:
        raise ValidationError("A rotação deve estar entre 0 e 360.")


class RoomObjectValidator:
    def __init__(self, room_object: RoomObject):
        self.errors = {}
        self.room_object = room_object
        self.has_category = self.room_object.category_id is not None
        self.check_attributes: QuerySet[Attribute] | None = (
            self.room_object.category.attributes.all() if self.has_category else None
        )

    def _add_error(self, key: str, message: str):
        self.errors.setdefault(key, [])
        self.errors[key].append(message)

    def validate(self):
        from .models import Attribute

        attributes = self.room_object.attributes

        if not isinstance(attributes, dict):
            raise ValidationError(
                {"attributes": "Os atributos devem ser um objeto JSON."}
            )

        # Without a category there is nothing to validate the attributes against.
        # The "category" field validation already reports the missing value.
        if not self.has_category:
            return

        for item in self.check_attributes:
            value = attributes.get(item.name)

            if item.is_required and (value is None or value == ""):
                self._add_error(
                    key=f"attributes.{item.name}",
                    message="Este atributo é obrigatório.",
                )
                continue

            if value is None:
                continue

            if item.type == Attribute.DataType.TEXT:
                if not isinstance(value, str):
                    self._add_error(
                        key=f"attributes.{item.name}",
                        message="Insira um texto válida.",
                    )

            elif item.type == Attribute.DataType.INTEGER:
                if not isinstance(value, int) or isinstance(value, bool):
                    self._add_error(
                        key=f"attributes.{item.name}",
                        message="Insira um número válido.",
                    )

            elif item.type == Attribute.DataType.DECIMAL:
                if not isinstance(value, (int, float)) or isinstance(value, bool):
                    self._add_error(
                        key=f"attributes.{item.name}",
                        message="Insira um número válido.",
                    )

            elif item.type == Attribute.DataType.BOOLEAN:
                if not isinstance(value, bool):
                    self._add_error(
                        key=f"attributes.{item.name}",
                        message="Insira um booleano válido.",
                    )

            elif item.type == Attribute.DataType.SELECT:
                if value not in item.options or []:
                    self._add_error(
                        key=f"attributes.{item.name}",
                        message="Insira uma opção válido.",
                    )

            # Check validations
            validation: dict = item.validation or {}
            if isinstance(value, (int, float)) and not isinstance(value, bool):
                minimum = validation.get("min")
                maximum = validation.get("max")

                if minimum is not None and value < minimum:
                    self._add_error(
                        key=f"attributes.{item.name}",
                        message=f"'{item.label}' deve ser maior ou igual a {minimum}.",
                    )

                if maximum is not None and value > maximum:
                    self._add_error(
                        key=f"attributes.{item.name}",
                        message=f"'{item.label}' deve ser menor ou igual a {maximum}.",
                    )

            if isinstance(value, str):
                min_length = validation.get("min_length")
                max_length = validation.get("max_length")

                if min_length is not None and len(value) < min_length:
                    self._add_error(
                        key=f"attributes.{item.name}",
                        message=f"'{item.label}' deve possuir pelo menos {min_length} caracteres.",
                    )

                if max_length is not None and len(value) > max_length:
                    self._add_error(
                        key=f"attributes.{item.name}",
                        message=f"'{item.label}' deve possuir no máximo {max_length} caracteres.",
                    )

        if self.errors:
            raise ValidationError(self.errors)
