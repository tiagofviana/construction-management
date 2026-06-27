import logging
from django import forms, http
from django.template import loader
from django.core.cache import cache
from django.contrib.auth import forms as auth_forms
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.sites.shortcuts import get_current_site
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from . import models


class UserAdminChangeForm(auth_forms.UserChangeForm):
    class Meta(auth_forms.UserChangeForm.Meta):
        model = models.User
        fields = "__all__"


class UserAdminCreationForm(auth_forms.UserCreationForm):
    class Meta(auth_forms.UserCreationForm.Meta):
        model = models.User
        fields = ("email",)


class CustomUserCreationForm(auth_forms.UserCreationForm):
    email2 = forms.EmailField(required=True)

    class Meta(auth_forms.UserChangeForm.Meta):
        model = models.User
        fields = ("email", "first_name", "last_name")

    def clean(self):
        cleaned_data = super().clean()

        password1 = cleaned_data.get("password1")
        password2 = cleaned_data.get("password2")
        if password1 != password2:
            raise forms.ValidationError(
                {
                    "password1": 'Os campos "Senha" e "Senha novamente" são diferentes',
                    "password2": 'Os campos "Senha" e "Senha novamente" são diferentes',
                }
            )

        email = cleaned_data.get("email")
        email2 = cleaned_data.get("email2")
        if email != email2:
            raise forms.ValidationError(
                {
                    "email": 'Os campos "Email" e "Email novamente" são diferentes',
                    "email2": 'Os campos "Email" e "Email novamente" são diferentes',
                }
            )

        return cleaned_data

    def save(self, commit=True) -> models.User:
        user: models.User.User = super().save(commit=False)
        user.set_password(self.cleaned_data["password2"])
        if commit:
            user.save()
        return user


class ForgotPasswordForm(forms.Form):
    email = forms.EmailField(
        required=True,
        max_length=254,
    )

    def __init__(self, request: http.HttpRequest, *args, **kwargs):
        self.request = request
        super().__init__(*args, **kwargs)

    def clean(self):
        cleaned_data = super().clean()

        email = cleaned_data.get("email")
        email_key = f"api:forgot-password:counter:email-{email}"

        ip = self.request.META.get("REMOTE_ADDR")
        ip_key = f"api:forgot-password:counter:email-{ip}"

        email_counter = cache.get(email_key, 0)
        ip_counter = cache.get(ip_key, 0)

        if email_counter >= 5 or ip_counter >= 5:
            logging.warning(f'Limit on forgot-password. Email: "{email}". IP: "{ip}".')
            raise forms.ValidationError(
                "Muitas tentativas de redefinição de senha foram realizadas. Tente novamente mais tarde."
            )

        timeout = 24 * 60 * 60  # 24 hours
        cache.set(email_key, email_counter + 1, timeout=timeout)
        cache.set(email_key, email_counter + 1, timeout=timeout)

        return cleaned_data

    def send(self):
        email = self.cleaned_data.get("email")
        user = models.User.objects.filter(email=email, is_email_verified=True).first()

        if not user:
            return

        timeout = 60 * 60  # 1 hour
        key = f"password-reset-request:{user.id}"
        cache.set(key=key, value=True, timeout=timeout)

        uid = force_bytes(user.id)
        uidb64 = urlsafe_base64_encode(uid)
        token = PasswordResetTokenGenerator().make_token(user)
        domain = get_current_site(self.request)
        protocol = "https://" if self.request.is_secure() else "http://"

        html_message = loader.render_to_string(
            template_name="users/email/forgot-password.html",
            request=self.request,
            context={
                "protocol": protocol,
                "domain": domain,
                "uidb64": uidb64,
                "token": token,
            },
        )

        user.send_email(subject="Reset", html_message=html_message)


class SaveProfileForm(forms.ModelForm):
    class Meta:
        model = models.User
        fields = ["first_name", "last_name"]


class CustomAuthenticationForm(auth_forms.AuthenticationForm):
    stay_connected = forms.BooleanField(required=False)

    def clean(self):
        username = self.cleaned_data.get("username")
        password = self.cleaned_data.get("password")

        self.user_cache: models.User = models.User.objects.filter(
            email=username
        ).first()

        if self.user_cache is None:
            raise self.get_invalid_login_error()

        if not self.user_cache.check_password(password):
            raise self.get_invalid_login_error()

        self.confirm_login_allowed(self.user_cache)

        return self.cleaned_data


class PasswordResetForm(forms.Form):
    error_messages = {
        "password_mismatch": "Os dois campos de senha não coincidiram.",
    }

    password1 = forms.CharField(
        label="Senha",
        required=True,
        strip=False,
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password"}),
    )
    password2 = forms.CharField(
        label="Confirmação da senha",
        required=True,
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password"}),
        strip=False,
    )

    def clean(self):
        cleaned_data = super().clean()
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")

        if password1 and password2 and password1 != password2:
            raise forms.ValidationError(
                self.error_messages["password_mismatch"],
                code="password_mismatch",
            )

        return cleaned_data

    def save(self, user: models.User, commit=True):
        password = self.cleaned_data.get("password1")
        user.set_password(password)

        if commit:
            user.save()

        return user
