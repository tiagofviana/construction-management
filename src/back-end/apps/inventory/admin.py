from django.contrib import admin
from . import forms, models


class AttributeInline(admin.TabularInline):
    """Read-only list of the category attributes."""

    model = models.Attribute
    fields = ["label", "name", "type", "is_required", "help_text"]
    readonly_fields = fields
    extra = 0
    can_delete = False
    show_change_link = True

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(models.Category)
class CategoryAdmin(admin.ModelAdmin):
    inlines = [AttributeInline]


@admin.register(models.Attribute)
class AttributeAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Item)
class ItemAdmin(admin.ModelAdmin):
    form = forms.ItemAdminForm
    # Fields generated automatically on save
    readonly_fields = ["description", "search_vector", "created_at"]


@admin.register(models.RoomItem)
class RoomItemAdmin(admin.ModelAdmin):
    pass
