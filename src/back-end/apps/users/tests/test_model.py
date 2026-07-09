from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.test import TestCase
from apps.users import models


class UserModelTests(TestCase):
    def test_user_flags(self):
        user = models.User.objects.create_user(
            email="test@example.com",
            password="secret123",
            first_name="Jane",
            last_name="Doe",
        )
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertTrue(user.is_email_verified)
        self.assertTrue(user.is_active)

    def test_staff_flags(self):
        admin = models.User.objects.create_superuser(
            email="admin@example.com",
            password="secret123",
            first_name="Admin",
            last_name="User",
        )

        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_email_verified)
        self.assertTrue(admin.is_active)

    def test_user_hashes_password_and_normalizes_email(self):
        user = models.User.objects.create_user(
            email="UpperCase@Example.COM",
            password="secret123",
            first_name="John",
            last_name="Smith",
        )

        self.assertTrue(user.check_password("secret123"))
        self.assertEqual(user.email, "UpperCase@example.com")
        self.assertFalse(user.is_email_verified)


class CustomGroupModelTests(TestCase):
    def test_custom_group_is_a_proxy_of_group(self):
        custom_group = models.CustomGroup.objects.create(name="Managers")

        self.assertIsInstance(custom_group, Group)
        self.assertTrue(custom_group._meta.proxy)
        self.assertEqual(custom_group.name, "Managers")


class CustomPermissionModelTests(TestCase):
    def test_custom_permission_is_a_proxy_of_permission(self):
        content_type = ContentType.objects.get(app_label="auth", model="permission")
        custom_permission = models.CustomPermission.objects.create(
            name="Can do something",
            codename="can_do_something",
            content_type=content_type,
        )

        self.assertIsInstance(custom_permission, Permission)
        self.assertTrue(custom_permission._meta.proxy)
        self.assertEqual(custom_permission.codename, "can_do_something")
