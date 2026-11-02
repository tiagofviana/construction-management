from django.urls import path
from apps.api.views import inventory

urlpatterns = [
    path("inventory/categories", inventory.CategoryListView.as_view()),
    path(
        "room/<uuid:room_id>/inventory-data", inventory.RoomInventoryDataView.as_view()
    ),
]
