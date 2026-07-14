import logging, hashlib
from django import http
from django.conf import settings
from django.contrib.auth import login
from django.contrib.auth.views import LoginView as AuthLoginView
from django.core.cache import cache
from django.middleware.csrf import get_token
from django.template import loader
from django.views import View
from django.views.generic.edit import CreateView, FormView
from apps.users.models import User
from apps.users import forms as users_form
from apps.api import responses
from .. import mixins


def hash_user_email(user: User):
    sha256_hash = hashlib.sha256(user.email.encode()).hexdigest()
    data = ""

    for item in range(6):
        number = int(sha256_hash[item], 16)
        data += f"{number}"

    return data[:6]


class LoginFormView(AuthLoginView):
    http_method_names = ["post"]
    form_class = users_form.CustomAuthenticationForm

    def form_valid(self, form: users_form.CustomAuthenticationForm):
        user: User = form.get_user()
        login(self.request, user)

        if not form.cleaned_data["stay_connected"]:
            self.request.session.set_expiry(0)

        return responses.Success()

    def form_invalid(self, form: users_form.CustomAuthenticationForm):
        return responses.Error(form.errors)


class ForgotPasswordFormView(FormView):
    http_method_names = ["post"]
    form_class = users_form.ForgotPasswordForm

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs["request"] = self.request
        return kwargs

    def form_valid(self, form: users_form.ForgotPasswordForm):
        form.send()
        return responses.Success()

    def form_invalid(self, form: users_form.ForgotPasswordForm):
        return responses.Error(form.errors)


# class SaveProfileFormView(mixins.ValidateJWTHeaderMixin, FormView):
#     http_method_names = ["post"]
#     form_class = users_form.SaveProfileForm

#     def get_form_kwargs(self):
#         kwargs = super().get_form_kwargs()
#         kwargs["instance"] = self.request.user
#         return kwargs

#     def form_valid(self, form: users_form.SaveProfileForm):
#         form.save()
#         user: User = self.request.user
#         logging.info(f"User {user.id} changed profile: {user.fullname}")
#         return responses.Success()

#     def form_invalid(self, form: users_form.SaveProfileForm):
#         return responses.Error(form.errors)


# class ValidateTokenView(mixins.ValidateJWTHeaderMixin, View):
#     http_method_names = ["get"]

#     def get(self, *args, **kwargs) -> http.JsonResponse:
#         return responses.NoContent()


# class SendVerificationEmailView(mixins.ValidateJWTHeaderMixin, View):
#     http_method_names = ["get"]

#     def get(self, *args, **kwargs) -> http.JsonResponse:
#         user: User = self.request.user
#         if user.is_email_verified:
#             return responses.Conflict()

#         cache_key = f"api:email-verification:counter:user-{user.id}"
#         counter = cache.get(cache_key, 0)

#         if counter >= 5:
#             logging.warning(
#                 f"Already send {counter} verification emails to the user {user.id}"
#             )
#             return responses.NoContent()

#         cache.set(cache_key, counter + 1, timeout=24 * 60 * 60)  # 24 hours
#         self._send_verification_email()

#         return responses.Success()

#     def _send_verification_email(self):
#         user: User = self.request.user
#         html_message = self._generate_email_message()

#         try:
#             logging.warning(f"Sending a verification email to the user {user.id}")
#             user.send_email(subject="Verificação de email", html_message=html_message)
#         except Exception as exception:
#             logging.error(
#                 f"Error on sending verification email to user ({user.id}): {str(exception)}"
#             )

#     def _generate_email_message(self) -> str:
#         code = hash_user_email(user=self.request.user)

#         return loader.render_to_string(
#             template_name="users/email/verification.html",
#             request=self.request,
#             context={
#                 "code": code,
#             },
#         )


# class EmailVerifyView(mixins.ValidateJWTHeaderMixin, View):
#     http_method_names = ["post"]

#     def post(self, *args, **kwargs) -> http.JsonResponse:
#         user: User = self.request.user
#         code = self.request.POST.get("code", "")
#         hashed_code = hash_user_email(user=self.request.user)

#         if code != hashed_code:
#             return responses.Conflict()

#         user.is_email_verified = True
#         user.save()
#         return responses.Success()


# class UserCreateView(CreateView):
#     form_class = users_form.CustomUserCreationForm

#     def form_valid(self, form: users_form.CustomUserCreationForm):
#         form.save()
#         return responses.Created()

#     def form_invalid(self, form: users_form.CustomUserCreationForm):
#         return responses.Error(form.errors)


class AccountInfoView(View):
    http_method_names = ["get"]

    def get(self, *args, **kwargs) -> http.JsonResponse:
        user: User = self.request.user

        if not user.is_authenticated:
            return responses.NoContent()

        data = {
            "firstName": user.first_name,
            "lastName": user.last_name,
            "email": user.email,
            "isStaff": user.is_staff,
            "lastLogin": user.last_login.isoformat(),
        }
        return responses.Success(data)
