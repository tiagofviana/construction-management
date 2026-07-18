from django.urls import path
from apps.api.views import employee

urlpatterns = [
    path("constructions/list", employee.ConstructionsListView.as_view()),
]
