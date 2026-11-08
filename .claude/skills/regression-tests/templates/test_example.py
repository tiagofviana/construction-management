from types import SimpleNamespace

from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.test import SimpleTestCase, TestCase

from .. import models, validators


def make_object(**kwargs):
    # Lightweight stand-in for a model instance, used when no database is needed.
    defaults = {"name": "example"}
    defaults.update(kwargs)
    return SimpleNamespace(**defaults)


class ExampleValidatorTests(SimpleTestCase):
    def test_accepts_valid_value(self):
        validators.validate_example(make_object())

    def test_rejects_invalid_value(self):
        with self.assertRaises(ValidationError) as error:
            validators.validate_example(make_object(name=""))

        self.assertEqual(error.exception.messages, ["Mensagem em português."])


class ExampleModelTests(TestCase):
    def setUp(self):
        self.instance = models.Example.objects.create(name="Exemplo")

    def test_string_representation(self):
        self.assertEqual(str(self.instance), f"Exemplo #{self.instance.id}")

    def test_name_is_unique(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                models.Example.objects.create(name="Exemplo")

    def test_regression_example(self):
        # Regression: <what used to break and why>
        ...
