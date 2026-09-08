from django.urls import path
from apps.api.views import account

urlpatterns = [
    path("login/form", account.LoginFormView.as_view()),
    # path("create", account.UserCreateView.as_view()),
    path("info/get", account.AccountInfoView.as_view()),
    # path("email-verification/send", account.SendVerificationEmailView.as_view()),
    # path("email-verification/verify", account.EmailVerifyView.as_view()),
    # path("forgot-password/form", account.ForgotPasswordFormView.as_view()),
    # path("settings/save-profile", account.SaveProfileFormView.as_view()),
]
