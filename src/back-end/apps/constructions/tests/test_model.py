from django.test import TestCase
from apps.constructions import models


class ConstructionModelTests(TestCase):
    def test_construction_creation_and_string_representation(self):
        construction = models.Construction.objects.create(
            name="Construção Teste",
            address="Rua Teste, 123",
        )

        self.assertEqual(construction.name, "Construção Teste")
        self.assertEqual(str(construction), "Construção Teste")


class FloorModelTests(TestCase):
    def test_floor_creation_with_construction_relationship(self):
        construction = models.Construction.objects.create(
            name="Construção Teste",
            address="Rua Teste, 123",
        )

        floor = models.Floor.objects.create(
            name="Térreo",
            construction=construction,
        )

        self.assertEqual(floor.construction, construction)
        self.assertEqual(str(floor), "Térreo")
        self.assertEqual(construction.floor_set.count(), 1)


class RoomModelTests(TestCase):
    def test_svg_view_box_create(self):
        construction = models.Construction.objects.create(
            name="Construção Teste",
            address="Rua Teste, 123",
        )

        floor = models.Floor.objects.create(
            name="Térreo",
            construction=construction,
        )

        room = models.Room.objects.create(
            floor=floor,
            svg_path="M 800 900 L 900, 900 C 970, 900, 960 1000, 900 1000",
            name="Sala",
            description="Descrição da sala",
            area=20.0,
            color="#123456",
        )

        self.assertEqual(room.svg_view_box, "800.00 900.00 148.82 100.00")

    def test_svg_view_box_update(self):
        construction = models.Construction.objects.create(
            name="Construção Teste",
            address="Rua Teste, 123",
        )

        floor = models.Floor.objects.create(
            name="Térreo",
            construction=construction,
        )

        room = models.Room.objects.create(
            floor=floor,
            svg_path="M 0 0 L 10 0 L 10 10 L 0 10 Z",
            name="Cozinha",
            description="Descrição da cozinha",
            area=12.5,
            color="#abcdef",
        )

        room.svg_path = "M 5 5 L 15 5 L 15 15 L 5 15 Z"
        room.save()

        self.assertEqual(room.svg_view_box, "5.00 5.00 10.00 10.00")
