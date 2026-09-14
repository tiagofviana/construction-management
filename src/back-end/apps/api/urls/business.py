from django.urls import path, include
from apps.api.views import business

urlpatterns = [
    path("constructions-list", business.ConstructionsListView.as_view()),
    path("<int:employee_id>/permissions-list", business.PermissionsDataView.as_view()),
    path("<int:employee_id>/dashboard/data", business.DashboardDataView.as_view()),
]
