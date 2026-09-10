from django.urls import path, include
from apps.api.views import maps

maps_patterns = [
    path("floors-list", maps.FloorListView.as_view()),
    path("floor/<int:floor_id>/data", maps.FloorDataView.as_view()),
    path(
        "floor/<int:floor_id>/update/form",
        maps.UpdateFloorFormView.as_view(),
    ),
    path("room-create/form", maps.RoomCreateView.as_view()),
    path("room-update/<str:room_id>/form", maps.RoomUpdateView.as_view()),
]

urlpatterns = [
    path("constructions-list", maps.ConstructionsListView.as_view()),
    path("<int:employee_id>/", include(maps_patterns)),
]
