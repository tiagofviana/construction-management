from django.urls import path
from . import views

app_name = "users"

urlpatterns = [
    path("servidor/sair", views.LogoutView.as_view(), name="logout"),
    path(
        "alterar-senha/<str:uidb64>/<str:token>",
        views.PasswordResetView.as_view(),
        name="password-reset",
    ),
]
