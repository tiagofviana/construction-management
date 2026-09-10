from django.contrib import admin
from . import models


@admin.register(models.Construction)
class ConstructionAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Employee)
class EmployeeAdmin(admin.ModelAdmin):
    readonly_fields = ("id",)
    filter_horizontal = ("permissions", "groups")
    fieldsets = (
        (
            "Identificação",
            {
                "fields": (
                    "id",
                    ("user", "construction"),
                ),
            },
        ),
        (
            "Permissões",
            {
                "fields": (
                    "is_active",
                    "is_admin",
                    "groups",
                    "permissions",
                )
            },
        ),
    )


@admin.register(models.ConstructionPermission)
class ConstructionPermissionAdmin(admin.ModelAdmin):
    list_display = ("construction", "name", "codename")
    ordering = ("construction",)


@admin.register(models.ConstructionGroup)
class ConstructionGroupAdmin(admin.ModelAdmin):
    list_display = ("construction", "name")
    filter_horizontal = ("permissions",)
