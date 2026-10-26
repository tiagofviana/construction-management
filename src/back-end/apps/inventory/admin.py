from django.contrib import admin
from . import forms, models


@admin.register(models.Category)
class CategoryAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Attribute)
class AttributeAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Item)
class ItemAdmin(admin.ModelAdmin):
    form = forms.ItemAdminForm


@admin.register(models.RoomItem)
class RoomItemAdmin(admin.ModelAdmin):
    pass
