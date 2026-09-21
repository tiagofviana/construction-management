from django.urls import path
from apps.api.views import account

urlpatterns = [
    path("login/form", account.LoginFormView.as_view()),
    path("create/form", account.UserCreateView.as_view()),
    path("info/get", account.AccountInfoView.as_view()),
    path("email-verification/send", account.SendVerificationEmailView.as_view()),
    path("email-verification/verify", account.EmailVerifyView.as_view()),
    path("forgot-password/form", account.ForgotPasswordFormView.as_view()),
    path(
        "validate-change-password/<str:uidb64>/<str:token>/form",
        account.ValidatePasswordReset.as_view(),
    ),
    path(
        "change-password/<str:uidb64>/<str:token>/form",
        account.PasswordResetFormView.as_view(),
    ),
    # path("settings/save-profile", account.SaveProfileFormView.as_view()),
]
