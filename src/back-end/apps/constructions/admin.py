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
    ordering = ("construction", "name")


@admin.register(models.Room)
class RoomAdmin(admin.ModelAdmin):
    ordering = ("floor",)
