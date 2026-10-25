from types import SimpleNamespace

from django.core.exceptions import ValidationError
from django.db import models
from django.test import SimpleTestCase

from . import validators
from .models import Attribute, Item


class ItemDescriptionTests(SimpleTestCase):
    def test_generate_description_uses_portuguese_labels_and_formats_values(self):
        item = Item()
        item.attributes = {
            "airConditionerPower": 12000,
            "width": 83.7,
            "length": 30.8,
            "color": "branco",
            "hasRemote": False,
            "hasTimer": True,
        }
        attributes = [
            SimpleNamespace(
                label="BTUs",
                name="airConditionerPower",
                type=Attribute.DataType.INTEGER,
            ),
            SimpleNamespace(
                label="largura (cm)",
                name="width",
                type=Attribute.DataType.DECIMAL,
            ),
            SimpleNamespace(
                label="comprimento (cm)",
                name="length",
                type=Attribute.DataType.DECIMAL,
            ),
            SimpleNamespace(
                label="cor",
                name="color",
                type=Attribute.DataType.TEXT,
            ),
            SimpleNamespace(
                label="controle remoto",
                name="hasRemote",
                type=Attribute.DataType.BOOLEAN,
            ),
            SimpleNamespace(
                label="temporizador",
                name="hasTimer",
                type=Attribute.DataType.BOOLEAN,
            ),
        ]
        item._state.fields_cache["category"] = SimpleNamespace(
            attributes=SimpleNamespace(all=lambda: attributes)
        )

        description = item.generate_description()

        self.assertEqual(
            description,
            "BTUs 12000; largura (cm) 83,7; comprimento (cm) 30,8; "
            "cor branco; controle remoto Não; temporizador Sim",
        )
        self.assertEqual(item.description, description)

    def test_generate_description_skips_missing_values(self):
        item = Item()
        item.attributes = {"color": ""}
        attributes = [
            SimpleNamespace(
                label="cor",
                name="color",
                type=Attribute.DataType.TEXT,
            ),
            SimpleNamespace(
                label="controle remoto",
                name="has_remote",
                type=Attribute.DataType.BOOLEAN,
            ),
        ]
        item._state.fields_cache["category"] = SimpleNamespace(
            attributes=SimpleNamespace(all=lambda: attributes)
        )

        self.assertEqual(item.generate_description(), "")

    def test_attribute_fields_match_label_and_name_semantics(self):
        self.assertIsInstance(Attribute._meta.get_field("label"), models.CharField)
        self.assertIsInstance(Attribute._meta.get_field("name"), models.SlugField)


class AttributeValidationTests(SimpleTestCase):
    def test_validation_uses_english_name_and_portuguese_label(self):
        validators.RoomObjectValidator.errors = {}
        attribute = SimpleNamespace(
            label="potência (BTUs)",
            name="air_conditioner_power",
            is_required=True,
            type=Attribute.DataType.INTEGER,
            options=[],
            validation={"min": 12000},
        )
        room_object = SimpleNamespace(
            attributes={"air_conditioner_power": 10000},
            category=SimpleNamespace(
                attributes=SimpleNamespace(all=lambda: [attribute])
            ),
        )

        with self.assertRaises(ValidationError) as error:
            validators.RoomObjectValidator(room_object).validate()

        self.assertIn("attributes.air_conditioner_power", error.exception.message_dict)
        self.assertIn(
            "'potência (BTUs)' deve ser maior ou igual a 12000.",
            error.exception.message_dict["attributes.air_conditioner_power"],
        )
