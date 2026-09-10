from django.test import TestCase
from apps.business import models


class ConstructionModelTests(TestCase):
    def test_construction_creation_and_string_representation(self):
        construction = models.Construction.objects.create(
            name="Construção Teste",
            address="Rua Teste, 123",
        )

        self.assertEqual(construction.name, "Construção Teste")
        self.assertEqual(str(construction), "Construção Teste")
