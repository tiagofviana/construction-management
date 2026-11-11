import json
from django.core.cache import cache
from django.test import TestCase
from apps.business import models as business_models
from apps.maps import models as maps_models
from apps.users import models as users_models
from .. import models

SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"></svg>'


class UpdateRoomInventoryTests(TestCase):
    def setUp(self):
        cache.clear()
        self.construction = business_models.Construction.objects.create(
            name="Construção Teste",
            address="Rua Teste, 123",
        )
        self.user = users_models.User.objects.create_user(
            email="employee@example.com",
            password="secret123",
            first_name="Jane",
            last_name="Doe",
            is_email_verified=True,
        )
        self.employee = business_models.Employee.objects.create(
            construction=self.construction,
            user=self.user,
        )
        self.room = self.create_room(self.construction)

        category = models.Category.objects.create(
            name="Iluminação", description="Lâmpadas", svg=SVG
        )
        # bulk_create skips Item.save(), whose full_clean requires category attributes
        [item] = models.Item.objects.bulk_create(
            [models.Item(category=category, name="Lâmpada")]
        )
        self.room_item = models.RoomItem.objects.create(item=item, room=self.room)
        self.item = item

        self.client.force_login(self.user)

    def tearDown(self):
        cache.clear()

    def create_room(self, construction) -> maps_models.Room:
        floor = maps_models.Floor.objects.create(
            name="Térreo",
            construction=construction,
            order=construction.floor_set.count(),
        )
        return maps_models.Room.objects.create(
            floor=floor,
            svg_path="M 0 0 L 100 0 L 100 100 L 0 100 Z",
            name="Sala",
            description="Descrição da sala",
            area=20.0,
            color="#123456",
        )

    def grant_edit_permission(self):
        permission = business_models.ConstructionPermission.objects.get(
            construction=self.construction, codename="can_edit_roomItem"
        )
        self.employee.permissions.add(permission)

    def get_url(self, room_id=None) -> str:
        room_id = room_id or self.room.id
        return f"/api/employee/{self.employee.id}/room/{room_id}/inventory/update/form"

    def post_items(self, items, room_id=None):
        return self.client.post(self.get_url(room_id), {"items": json.dumps(items)})

    def item_data(self, **kwargs) -> dict:
        data = {
            "id": str(self.room_item.id),
            "position_x": 12.0,
            "position_y": 34.0,
            "rotation": 90.0,
        }
        data.update(kwargs)
        return data

    def test_updates_position_and_rotation(self):
        self.grant_edit_permission()

        response = self.post_items([self.item_data()])

        self.assertEqual(response.status_code, 200)
        self.room_item.refresh_from_db()
        self.assertEqual(self.room_item.position_x, 12.0)
        self.assertEqual(self.room_item.position_y, 34.0)
        self.assertEqual(self.room_item.rotation, 90.0)

    def test_without_permission_is_forbidden(self):
        response = self.post_items([self.item_data()])

        self.assertEqual(response.status_code, 403)
        self.room_item.refresh_from_db()
        self.assertEqual(self.room_item.position_x, 0.0)

    def test_room_from_another_construction_is_forbidden(self):
        self.grant_edit_permission()
        other = business_models.Construction.objects.create(
            name="Outra", address="Rua 2"
        )
        other_room = self.create_room(other)

        response = self.post_items([self.item_data()], room_id=other_room.id)

        self.assertEqual(response.status_code, 403)

    def test_item_from_another_room_is_rejected(self):
        self.grant_edit_permission()
        other_room = self.create_room(self.construction)
        other_item = models.RoomItem.objects.create(item=self.item, room=other_room)

        response = self.post_items([self.item_data(id=str(other_item.id))])

        self.assertEqual(response.status_code, 400)
        self.assertIn("items", response.json()["errors"])
        other_item.refresh_from_db()
        self.assertEqual(other_item.position_x, 0.0)

    def test_invalid_values_are_rejected(self):
        self.grant_edit_permission()
        invalid_items = [
            self.item_data(position_x=-1),
            self.item_data(position_y=-1),
            self.item_data(rotation=361),
            self.item_data(rotation="abc"),
            {"position_x": 1, "position_y": 1, "rotation": 0},
        ]

        for item in invalid_items:
            with self.subTest(item=item):
                response = self.post_items([item])
                self.assertEqual(response.status_code, 400)

        self.room_item.refresh_from_db()
        self.assertEqual(self.room_item.position_x, 0.0)

    def test_empty_or_malformed_items_are_rejected(self):
        self.grant_edit_permission()

        for items in ([], {"id": "x"}, ["not-a-dict"]):
            with self.subTest(items=items):
                response = self.post_items(items)
                self.assertEqual(response.status_code, 400)
