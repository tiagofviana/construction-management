from django.contrib import admin
from . import models


@admin.register(models.Construction)
class ConstructionAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Employee)
class EmployeeAdmin(admin.ModelAdmin):
    readonly_fields = ("id",)
    list_display = ("user", "user__email", "construction")
    ordering = ("construction", "user__first_name", "user__last_name", "user__email")
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

    def save_model(self, request, obj: models.Employee, form, change):
        super().save_model(request, obj, form, change)
        obj.delete_perms_cache()


@admin.register(models.ConstructionPermission)
class ConstructionPermissionAdmin(admin.ModelAdmin):
    list_display = ("construction", "name", "codename")
    ordering = ("construction",)


@admin.register(models.ConstructionGroup)
class ConstructionGroupAdmin(admin.ModelAdmin):
    list_display = ("construction", "name")
    filter_horizontal = ("permissions",)
