from django.test import TestCase

from .models import Construction, Floor, Room


class RoomModelTests(TestCase):
    def test_room_save_populates_svg_view_box_from_svg_path(self):
        construction = Construction.objects.create(
            name="Construção Teste",
            address="Rua Teste, 123",
        )

        floor = Floor.objects.create(
            name="Térreo",
            construction=construction,
        )

        room = Room.objects.create(
            floor=floor,
            svg_path="M 800 900 L 900, 900 C 970, 900, 960 1000, 900 1000",
            name="Sala",
            description="Descrição da sala",
            area=20.0,
            color="#123456",
        )

        self.assertEqual(room.svg_view_box, "800.00 900.00 148.82 100.00")
