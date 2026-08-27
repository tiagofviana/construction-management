from django.urls import path, include
from apps.api.views import employee

employee_patterns = [
    path("dashboard/data", employee.DashboardDataView.as_view()),
    path("floors-list", employee.FloorListView.as_view()),
    path("floor/<int:floor_id>/data", employee.FloorDataView.as_view()),
    path(
        "floor/<int:floor_id>/update/form",
        employee.UpdateFloorFormView.as_view(),
    ),
    path("room-create/form", employee.RoomCreateView.as_view()),
    path("room-update/<str:room_id>/form", employee.RoomUpdateView.as_view()),
]

urlpatterns = [
    path("constructions-list", employee.ConstructionsListView.as_view()),
    path("<int:employee_id>/", include(employee_patterns)),
]
