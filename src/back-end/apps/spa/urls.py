from django.urls import path, re_path
from . import views

app_name = "spa"

urlpatterns = [
    re_path(r".*", views.IndexTemplateView.as_view(), name="index"),
]
