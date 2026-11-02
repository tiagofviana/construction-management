from django.apps import apps
from django.core.cache import cache
from django.db import IntegrityError, transaction
from django.test import TestCase
from apps.business import models, permissions
from apps.users import models as users_models


def get_declared_permissions() -> set:
    codenames = set()
    for model in apps.get_models():
        for codename, _ in getattr(model, "construction_permissions", []):
            codenames.add(codename)
    return codenames


class ConstructionModelTests(TestCase):
    def test_construction_creation_and_string_representation(self):
        construction = models.Construction.objects.create(
            name="Construção Teste",
            address="Rua Teste, 123",
        )

        self.assertEqual(construction.name, "Construção Teste")
        self.assertEqual(str(construction), f"Construção Teste #{construction.id}")

    def test_creation_creates_declared_permissions(self):
        construction = models.Construction.objects.create(
            name="Construção Teste",
            address="Rua Teste, 123",
        )

        codenames = models.ConstructionPermission.objects.filter(
            construction=construction
        ).values_list("codename", flat=True)

        self.assertSetEqual(set(codenames), get_declared_permissions())
        self.assertEqual(len(codenames), len(get_declared_permissions()))

    def test_multiple_constructions_get_their_own_permissions(self):
        # Regression: PermissionsUpdater used to share its permissions list
        # between instances, raising "Reapeated permission codename".
        first = models.Construction.objects.create(name="Primeira", address="Rua 1")
        second = models.Construction.objects.create(name="Segunda", address="Rua 2")

        expected = len(get_declared_permissions())
        self.assertEqual(first.constructionpermission_set.count(), expected)
        self.assertEqual(second.constructionpermission_set.count(), expected)

    def test_update_does_not_duplicate_permissions(self):
        construction = models.Construction.objects.create(
            name="Construção Teste",
            address="Rua Teste, 123",
        )
        expected = construction.constructionpermission_set.count()

        construction.name = "Construção Editada"
        construction.save()

        self.assertEqual(construction.constructionpermission_set.count(), expected)

    def test_delete_cascades_to_related_objects(self):
        construction = models.Construction.objects.create(
            name="Construção Teste",
            address="Rua Teste, 123",
        )
        user = users_models.User.objects.create_user(
            email="employee@example.com",
            password="secret123",
            first_name="Jane",
            last_name="Doe",
        )
        models.ConstructionGroup.objects.create(construction=construction, name="Equipe")
        models.Employee.objects.create(construction=construction, user=user)

        construction.delete()

        self.assertFalse(models.ConstructionPermission.objects.exists())
        self.assertFalse(models.ConstructionGroup.objects.exists())
        self.assertFalse(models.Employee.objects.exists())
        self.assertTrue(users_models.User.objects.filter(pk=user.pk).exists())


class PermissionsUpdaterTests(TestCase):
    def test_instances_do_not_share_permissions(self):
        first = permissions.PermissionsUpdater()
        second = permissions.PermissionsUpdater()

        self.assertIsNot(first.permissions, second.permissions)
        self.assertEqual(first.permissions, second.permissions)

    def test_update_recreates_missing_permissions(self):
        construction = models.Construction.objects.create(
            name="Construção Teste",
            address="Rua Teste, 123",
        )
        construction.constructionpermission_set.filter(
            codename="can_view_employees"
        ).delete()

        permissions.PermissionsUpdater().update()

        self.assertTrue(
            construction.constructionpermission_set.filter(
                codename="can_view_employees"
            ).exists()
        )


class ConstructionPermissionModelTests(TestCase):
    def setUp(self):
        self.construction = models.Construction.objects.create(
            name="Construção Teste",
            address="Rua Teste, 123",
        )

    def test_string_representation(self):
        permission = models.ConstructionPermission.objects.get(
            construction=self.construction,
            codename="can_view_employees",
        )

        self.assertEqual(str(permission), "Construção Teste — can_view_employees")

    def test_codename_is_unique_per_construction(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                models.ConstructionPermission.objects.create(
                    construction=self.construction,
                    codename="can_view_employees",
                    name="Outro nome",
                )

    def test_same_codename_in_another_construction(self):
        other = models.Construction.objects.create(name="Outra", address="Rua 2")

        self.assertTrue(
            models.ConstructionPermission.objects.filter(
                construction=other,
                codename="can_view_employees",
            ).exists()
        )


class ConstructionGroupModelTests(TestCase):
    def setUp(self):
        self.construction = models.Construction.objects.create(
            name="Construção Teste",
            address="Rua Teste, 123",
        )

    def test_string_representation(self):
        group = models.ConstructionGroup.objects.create(
            construction=self.construction,
            name="Engenheiros",
        )

        self.assertEqual(str(group), "Construção Teste — Engenheiros")

    def test_name_is_unique_per_construction(self):
        models.ConstructionGroup.objects.create(
            construction=self.construction,
            name="Engenheiros",
        )

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                models.ConstructionGroup.objects.create(
                    construction=self.construction,
                    name="Engenheiros",
                )

    def test_same_name_in_another_construction(self):
        other = models.Construction.objects.create(name="Outra", address="Rua 2")
        models.ConstructionGroup.objects.create(
            construction=self.construction,
            name="Engenheiros",
        )

        group = models.ConstructionGroup.objects.create(
            construction=other,
            name="Engenheiros",
        )

        self.assertEqual(group.construction, other)


class EmployeeModelTests(TestCase):
    def setUp(self):
        cache.clear()
        self.construction = models.Construction.objects.create(
            name="Construção Teste",
            address="Rua Teste, 123",
        )
        self.user = users_models.User.objects.create_user(
            email="employee@example.com",
            password="secret123",
            first_name="Jane",
            last_name="Doe",
        )
        self.employee = models.Employee.objects.create(
            construction=self.construction,
            user=self.user,
        )

    def tearDown(self):
        cache.clear()

    def get_permission(self, codename: str) -> models.ConstructionPermission:
        return models.ConstructionPermission.objects.get(
            construction=self.construction,
            codename=codename,
        )

    def test_defaults(self):
        self.assertTrue(self.employee.is_active)
        self.assertFalse(self.employee.is_admin)

    def test_string_representation(self):
        self.assertEqual(
            str(self.employee),
            f"{self.construction} — {self.user}",
        )

    def test_user_is_unique_per_construction(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                models.Employee.objects.create(
                    construction=self.construction,
                    user=self.user,
                )

    def test_admin_has_any_permission(self):
        self.employee.is_admin = True

        self.assertTrue(self.employee.has_permission("can_view_employees"))
        self.assertTrue(self.employee.has_permission("non_existent_permission"))

    def test_without_permissions(self):
        self.assertEqual(self.employee.get_all_permissions(), [])
        self.assertFalse(self.employee.has_permission("can_view_employees"))

    def test_direct_permission(self):
        self.employee.permissions.add(self.get_permission("can_view_employees"))

        self.assertTrue(self.employee.has_permission("can_view_employees"))
        self.assertFalse(self.employee.has_permission("can_add_employees"))

    def test_group_permission(self):
        group = models.ConstructionGroup.objects.create(
            construction=self.construction,
            name="Engenheiros",
        )
        group.permissions.add(self.get_permission("can_add_employees"))
        self.employee.groups.add(group)

        self.assertTrue(self.employee.has_permission("can_add_employees"))
        self.assertFalse(self.employee.has_permission("can_view_employees"))

    def test_get_all_permissions_merges_and_removes_duplicates(self):
        view = self.get_permission("can_view_employees")
        add = self.get_permission("can_add_employees")
        group = models.ConstructionGroup.objects.create(
            construction=self.construction,
            name="Engenheiros",
        )
        group.permissions.add(view, add)
        self.employee.permissions.add(view)
        self.employee.groups.add(group)

        self.assertCountEqual(
            self.employee.get_all_permissions(),
            [
                {"codename": view.codename, "name": view.name},
                {"codename": add.codename, "name": add.name},
            ],
        )

    def test_permissions_are_cached(self):
        self.assertFalse(self.employee.has_permission("can_view_employees"))

        self.employee.permissions.add(self.get_permission("can_view_employees"))

        self.assertFalse(self.employee.has_permission("can_view_employees"))
        self.assertTrue(
            self.employee.has_permission("can_view_employees", use_cache=False)
        )

    def test_delete_perms_cache(self):
        self.assertFalse(self.employee.has_permission("can_view_employees"))
        self.employee.permissions.add(self.get_permission("can_view_employees"))

        self.employee.delete_perms_cache()

        self.assertTrue(self.employee.has_permission("can_view_employees"))

    def test_cache_is_per_employee(self):
        other_user = users_models.User.objects.create_user(
            email="other@example.com",
            password="secret123",
            first_name="John",
            last_name="Smith",
        )
        other = models.Employee.objects.create(
            construction=self.construction,
            user=other_user,
        )
        self.employee.permissions.add(self.get_permission("can_view_employees"))

        self.assertTrue(self.employee.has_permission("can_view_employees"))
        self.assertFalse(other.has_permission("can_view_employees"))
