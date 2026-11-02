from types import SimpleNamespace

from django.core.exceptions import ValidationError
from django.test import SimpleTestCase

from .. import validators
from ..models import Attribute


def make_attribute(**kwargs):
    defaults = {
        "label": "atributo",
        "name": "attribute",
        "is_required": False,
        "type": Attribute.DataType.TEXT,
        "options": [],
        "validation": {},
    }
    defaults.update(kwargs)
    return SimpleNamespace(**defaults)


def make_item(attributes, category_attributes=None, has_category=True):
    category_attributes = category_attributes or []
    return SimpleNamespace(
        attributes=attributes,
        category_id=1 if has_category else None,
        category=SimpleNamespace(
            attributes=SimpleNamespace(all=lambda: category_attributes)
        ),
    )


class ValidatePositionTests(SimpleTestCase):
    def test_accepts_zero_and_positive_values(self):
        validators.validate_position(0)
        validators.validate_position(10.5)

    def test_rejects_negative_values(self):
        with self.assertRaises(ValidationError) as error:
            validators.validate_position(-0.1)

        self.assertEqual(
            error.exception.messages, ["A posição deve ser maior ou igual a 0."]
        )


class ValidateRotationTests(SimpleTestCase):
    def test_accepts_values_between_0_and_360(self):
        validators.validate_rotation(0)
        validators.validate_rotation(180)
        validators.validate_rotation(360)

    def test_rejects_values_out_of_range(self):
        for value in (-1, 360.1):
            with self.subTest(value=value):
                with self.assertRaises(ValidationError) as error:
                    validators.validate_rotation(value)

                self.assertEqual(
                    error.exception.messages,
                    ["A rotação deve estar entre 0 e 360."],
                )


class RoomItemValidatorTests(SimpleTestCase):
    def assertValid(self, item):
        validators.RoomItemValidator(item).validate()

    def assertErrors(self, item, key, messages):
        with self.assertRaises(ValidationError) as error:
            validators.RoomItemValidator(item).validate()

        self.assertEqual(error.exception.message_dict[key], messages)
        return error.exception.message_dict

    def test_rejects_attributes_that_are_not_a_dict(self):
        for value in ([], "texto", None, 1):
            with self.subTest(value=value):
                self.assertErrors(
                    make_item(value),
                    "attributes",
                    ["Os atributos devem ser um objeto JSON."],
                )

    def test_skips_attribute_validation_without_category(self):
        self.assertValid(make_item({"unknown": "valor"}, has_category=False))

    def test_accepts_empty_attributes_for_category_without_attributes(self):
        self.assertValid(make_item({}))

    def test_rejects_attributes_not_defined_in_category(self):
        attribute = make_attribute(name="color")

        self.assertErrors(
            make_item({"color": "branco", "power": 12000}, [attribute]),
            "attributes",
            ['O atributo "power" não existe para a categoria selecionada.'],
        )

    def test_reports_each_unknown_attribute(self):
        with self.assertRaises(ValidationError) as error:
            validators.RoomItemValidator(make_item({"a": 1, "b": 2})).validate()

        self.assertCountEqual(
            error.exception.message_dict["attributes"],
            [
                'O atributo "a" não existe para a categoria selecionada.',
                'O atributo "b" não existe para a categoria selecionada.',
            ],
        )

    def test_reports_unknown_and_invalid_attributes_together(self):
        attribute = make_attribute(name="power", type=Attribute.DataType.INTEGER)

        errors = self.assertErrors(
            make_item({"power": "alto", "extra": 1}, [attribute]),
            "attributes",
            ['O atributo "extra" não existe para a categoria selecionada.'],
        )
        self.assertEqual(errors["attributes.power"], ["Insira um número válido."])

    def test_required_attribute_missing_or_empty(self):
        attribute = make_attribute(name="color", is_required=True)

        for attributes in ({}, {"color": None}, {"color": ""}):
            with self.subTest(attributes=attributes):
                self.assertErrors(
                    make_item(attributes, [attribute]),
                    "attributes.color",
                    ["Este atributo é obrigatório."],
                )

    def test_optional_attribute_may_be_missing_or_null(self):
        attribute = make_attribute(name="color", type=Attribute.DataType.INTEGER)

        self.assertValid(make_item({}, [attribute]))
        self.assertValid(make_item({"color": None}, [attribute]))

    def test_text_type(self):
        attribute = make_attribute(name="color", type=Attribute.DataType.TEXT)

        self.assertValid(make_item({"color": "branco"}, [attribute]))
        self.assertErrors(
            make_item({"color": 1}, [attribute]),
            "attributes.color",
            ["Insira um texto válida."],
        )

    def test_integer_type(self):
        attribute = make_attribute(name="power", type=Attribute.DataType.INTEGER)

        self.assertValid(make_item({"power": 12000}, [attribute]))
        for value in (1.5, "1", True):
            with self.subTest(value=value):
                self.assertErrors(
                    make_item({"power": value}, [attribute]),
                    "attributes.power",
                    ["Insira um número válido."],
                )

    def test_decimal_type(self):
        attribute = make_attribute(name="width", type=Attribute.DataType.DECIMAL)

        self.assertValid(make_item({"width": 83.7}, [attribute]))
        self.assertValid(make_item({"width": 83}, [attribute]))
        for value in ("83,7", False):
            with self.subTest(value=value):
                self.assertErrors(
                    make_item({"width": value}, [attribute]),
                    "attributes.width",
                    ["Insira um número válido."],
                )

    def test_boolean_type(self):
        attribute = make_attribute(name="hasRemote", type=Attribute.DataType.BOOLEAN)

        self.assertValid(make_item({"hasRemote": False}, [attribute]))
        for value in (0, "true"):
            with self.subTest(value=value):
                self.assertErrors(
                    make_item({"hasRemote": value}, [attribute]),
                    "attributes.hasRemote",
                    ["Insira um booleano válido."],
                )

    def test_select_type(self):
        attribute = make_attribute(
            name="voltage",
            type=Attribute.DataType.SELECT,
            options=["110V", "220V"],
        )

        self.assertValid(make_item({"voltage": "220V"}, [attribute]))
        self.assertErrors(
            make_item({"voltage": "380V"}, [attribute]),
            "attributes.voltage",
            ["Insira uma opção válido."],
        )

    def test_numeric_min_and_max(self):
        attribute = make_attribute(
            label="potência (BTUs)",
            name="power",
            type=Attribute.DataType.INTEGER,
            validation={"min": 9000, "max": 30000},
        )

        self.assertValid(make_item({"power": 9000}, [attribute]))
        self.assertValid(make_item({"power": 30000}, [attribute]))
        self.assertErrors(
            make_item({"power": 8999}, [attribute]),
            "attributes.power",
            ["'potência (BTUs)' deve ser maior ou igual a 9000."],
        )
        self.assertErrors(
            make_item({"power": 30001}, [attribute]),
            "attributes.power",
            ["'potência (BTUs)' deve ser menor ou igual a 30000."],
        )

    def test_min_and_max_ignore_booleans(self):
        attribute = make_attribute(
            name="hasRemote",
            type=Attribute.DataType.BOOLEAN,
            validation={"min": 5},
        )

        self.assertValid(make_item({"hasRemote": True}, [attribute]))

    def test_text_min_and_max_length(self):
        attribute = make_attribute(
            label="cor",
            name="color",
            validation={"min_length": 3, "max_length": 6},
        )

        self.assertValid(make_item({"color": "azul"}, [attribute]))
        self.assertErrors(
            make_item({"color": "ab"}, [attribute]),
            "attributes.color",
            ["'cor' deve possuir pelo menos 3 caracteres."],
        )
        self.assertErrors(
            make_item({"color": "amarelo"}, [attribute]),
            "attributes.color",
            ["'cor' deve possuir no máximo 6 caracteres."],
        )

    def test_type_and_range_errors_are_accumulated(self):
        attribute = make_attribute(
            label="largura",
            name="width",
            type=Attribute.DataType.INTEGER,
            validation={"min": 10},
        )

        self.assertErrors(
            make_item({"width": 5.5}, [attribute]),
            "attributes.width",
            ["Insira um número válido.", "'largura' deve ser maior ou igual a 10."],
        )

    def test_validation_none_is_treated_as_empty(self):
        attribute = make_attribute(
            name="power", type=Attribute.DataType.INTEGER, validation=None
        )

        self.assertValid(make_item({"power": 1}, [attribute]))
