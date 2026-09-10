from django.urls import path, include
from apps.api.views import business

business_patterns = [
    path("dashboard/data", business.DashboardDataView.as_view()),
]

urlpatterns = [
    path("constructions-list", business.ConstructionsListView.as_view()),
    path("<int:employee_id>/", include(business_patterns)),
]
