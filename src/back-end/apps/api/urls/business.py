from django.urls import path, include
from apps.api.views import business

employee_patterns = [
    path("permissions-list", business.PermissionsDataView.as_view()),
    path("dashboard/data", business.DashboardDataView.as_view()),
    path("groups-list", business.GroupsDataView.as_view()),
    path("group/<int:group_id>/delete", business.GroupsDeleteView.as_view()),
    path("group/create/form", business.ConstructionGroupCreateView.as_view()),
    path(
        "group/<int:group_id>/update/form",
        business.ConstructionGroupUpdateView.as_view(),
    ),
    path(
        "construction/all-permissions-list",
        business.ConstructionPermissionsDataView.as_view(),
    ),
    path(
        "construction/all-groups-list",
        business.ConstructionGroupsDataView.as_view(),
    ),
    path("team-list", business.ConstructionTeamDataView.as_view()),
    path(
        "deactivate-employee/<int:deactivate_id>/",
        business.DeactivateEmployeeView.as_view(),
    ),
    path("search/new-employee", business.SearchNewEmployeeView.as_view()),
    path("employee/create/form", business.EmployeeCreateView.as_view()),
    path("employee/<int:emp_id>/update/form", business.EmployeeUpdateView.as_view()),
]


urlpatterns = [
    path("constructions-list", business.ConstructionsDataView.as_view()),
    path("<int:employee_id>/", include(employee_patterns)),
]
