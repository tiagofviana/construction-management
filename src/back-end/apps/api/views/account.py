import logging, hashlib
from django import http
from django.core.cache import cache
from django.contrib.auth import login
from django.contrib.auth.views import LoginView as AuthLoginView
from django.template import loader
from django.views import View
from django.views.generic.edit import CreateView, FormView
from apps.users.models import User
from apps.users import forms as users_form, validators as users_validators
from apps.core import utils as core_utils
from apps.api import responses


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


class ValidatePasswordReset(View):
    http_method_names = ["get"]

    def get(self, *args, **kwargs) -> http.JsonResponse:
        reset = users_validators.PasswordReset(self.request)
        if not reset.is_valid():
            return responses.NotFound()

        data = {"firstName": reset.user.first_name}
        return responses.Success(data, safe=False)


class PasswordResetFormView(FormView):
    http_method_names = ["post"]
    form_class = users_form.PasswordResetForm

    def dispatch(self, request: http.HttpRequest, *args, **kwargs):
        self.passwordReset = users_validators.PasswordReset(request)

        if not self.passwordReset.is_valid():
            return responses.NotFound()

        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form: users_form.PasswordResetForm):
        user = self.passwordReset.user
        key = users_validators.PasswordReset.get_cache_key(user)
        cache.set(key=key, value=1, timeout=1)
        form.save(user)
        logging.info(f"User #{self.user_cache.id} changed the password.")
        return responses.Success()

    def form_invalid(self, form: users_form.PasswordResetForm):
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


class SendVerificationEmailView(View):
    http_method_names = ["get"]

    def get(self, *args, **kwargs) -> http.JsonResponse:
        user: User = self.request.user

        if not user.is_authenticated:
            return responses.Unauthorized(request=self.request)

        if user.is_email_verified:
            return responses.Conflict()

        cache_key = f"api:send-email-verification:user-{user.id}"
        counter = cache.get(cache_key, 0)
        if counter >= 5:
            logging.warning(
                f"Already send {counter} verification emails to the user #{user.id}"
            )
            return responses.NoContent()

        cache.set(cache_key, counter + 1, timeout=24 * 60 * 60)  # 24 hours
        self._send_verification_email()

        return responses.Success()

    def _send_verification_email(self):
        user: User = self.request.user
        html_message = self._generate_email_message()

        try:
            logging.warning(f"Sending a verification email to the user #{user.id}")
            user.send_email(subject="Verificação de email", html_message=html_message)
        except Exception as exception:
            logging.error(
                f"Error on sending verification email to user #{user.id}. Error: {str(exception)}"
            )

    def _generate_email_message(self) -> str:
        code = hash_user_email(user=self.request.user)

        return loader.render_to_string(
            template_name="users/email/verification.html",
            request=self.request,
            context={
                "code": code,
            },
        )


class EmailVerifyView(View):
    http_method_names = ["post"]

    def post(self, *args, **kwargs) -> http.JsonResponse:
        user: User = self.request.user

        if not user.is_authenticated:
            return responses.Unauthorized(request=self.request)

        code = self.request.POST.get("code", "")
        hashed_code = hash_user_email(user=self.request.user)

        if code != hashed_code:
            return responses.Conflict()

        user.is_email_verified = True
        user.save()
        return responses.Success()


class UserCreateView(CreateView):
    form_class = users_form.CustomUserCreationForm

    def form_valid(self, form: users_form.CustomUserCreationForm):
        user = form.save()
        ip = core_utils.get_client_ip(self.request)
        logging.info(f'New user #{user.id}. Client ip "{ip}".')
        return responses.Created()

    def form_invalid(self, form: users_form.CustomUserCreationForm):
        return responses.Error(form.errors)


class AccountInfoView(View):
    http_method_names = ["get"]

    def get(self, *args, **kwargs) -> http.JsonResponse:
        user: User = self.request.user

        if not user.is_authenticated:
            return responses.NoContent()

        data = {
            "firstName": user.first_name,
            "lastName": user.last_name,
            "email": self._mask_email(user.email),
            "isStaff": user.is_staff,
            "lastLogin": user.last_login.isoformat(),
        }
        return responses.Success(data)

    def _mask_email(self, email: str):
        if "@" not in email:
            return email

        username, domain = email.split("@", 1)

        # Mask the username part
        if len(username) <= 2:
            masked_username = (
                username[0] + "*" * (len(username) - 1) if len(username) > 0 else ""
            )
        else:
            masked_username = username[0] + "*" * (len(username) - 2) + username[-1]

        # Split domain into name and extension
        domain_parts = domain.split(".")
        domain_name = domain_parts[0]
        tld = ".".join(domain_parts[1:])

        # Mask the domain name part
        if len(domain_name) <= 2:
            masked_domain_name = (
                domain_name[0] + "*" * (len(domain_name) - 1)
                if len(domain_name) > 0
                else ""
            )
        else:
            masked_domain_name = (
                domain_name[0] + "*" * (len(domain_name) - 2) + domain_name[-1]
            )

        masked_domain = f"{masked_domain_name}.{tld}" if tld else masked_domain_name

        return f"{masked_username}@{masked_domain}"
