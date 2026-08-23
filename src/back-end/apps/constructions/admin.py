from django.contrib import admin
from . import models


@admin.register(models.Construction)
class ConstructionAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Employee)
class EmployeeAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Floor)
class FloorAdmin(admin.ModelAdmin):
    list_display = ("name", "order", "construction")
    ordering = ("construction", "order")
    readonly_fields = ("id",)
    fields = ("id", "name", "order", "width", "height", "construction")


@admin.register(models.Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "floor", "get_construction")
    ordering = ("floor__construction", "floor", "name")

    @admin.display(description="Construção", ordering="floor__construction")
    def get_construction(self, obj: models.Room):
        return obj.floor.construction
