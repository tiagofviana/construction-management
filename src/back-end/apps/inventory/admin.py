from django.contrib import admin
from . import models


@admin.register(models.Category)
class CategoryAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Attribute)
class AttributeAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Item)
class ItemAdmin(admin.ModelAdmin):
    pass


@admin.register(models.RoomItem)
class RoomItemAdmin(admin.ModelAdmin):
    pass
