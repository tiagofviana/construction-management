from django.contrib import admin
from django.contrib.auth import admin as auth_admin
from django.contrib.auth.models import Group, Permission
from . import models, forms

admin.site.unregister(Group)


@admin.register(models.CustomGroup)
class CustomGroupAdmin(admin.ModelAdmin):
    pass


@admin.register(models.CustomPermission)
class CustomPermissionAdmin(admin.ModelAdmin):
    pass


@admin.register(models.User)
class UserAdmin(auth_admin.UserAdmin):
    form = forms.UserAdminChangeForm
    add_form = forms.UserAdminCreationForm
    list_display = (
        "id",
        "email",
        "is_superuser",
        "is_staff",
        "is_active",
        "is_email_verified",
        "created_at",
    )
    ordering = (
        "-is_superuser",
        "-is_staff",
        "-is_active",
        "-is_email_verified",
        "created_at",
    )
    list_filter = ("email", "created_at")
    search_fields = ("email",)
    readonly_fields = ("id", "is_superuser", "last_login", "created_at")
    add_fieldsets = (
        (
            "Identificação",
            {
                "fields": (("first_name", "last_name")),
            },
        ),
        (
            "Dados de login",
            {"fields": ("email", "is_email_verified", "password1", "password2")},
        ),
        (
            "Permissões",
            {
                "fields": (
                    "is_active",
                    "is_superuser",
                    "is_staff",
                    "groups",
                    "user_permissions",
                )
            },
        ),
    )
    fieldsets = (
        (
            "Identificação",
            {
                "fields": (
                    "id",
                    ("first_name", "last_name"),
                ),
            },
        ),
        (
            "Dados de login",
            {"fields": ("email", "is_email_verified", "password", "last_login")},
        ),
        (
            "Permissões",
            {
                "fields": (
                    "is_active",
                    "is_superuser",
                    "is_staff",
                    "groups",
                    "user_permissions",
                )
            },
        ),
    )
