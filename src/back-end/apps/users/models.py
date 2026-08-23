import string, secrets, logging, threading
from django.conf import settings
from django.db import models
from django.core.mail import send_mail
from django.contrib.auth.base_user import BaseUserManager, AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin, Permission, Group


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password, **other_fields):
        email = self.normalize_email(email)
        user: User = self.model(email=email, **other_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **other_fields):
        other_fields.setdefault("is_superuser", True)
        other_fields.setdefault("is_staff", True)
        other_fields.setdefault("is_email_verified", True)
        return self.create_user(email, password, **other_fields)

    def create_random_password(self) -> str:
        alphabet = string.ascii_letters + string.digits
        raw_password = "".join(secrets.choice(alphabet) for i in range(16))
        return raw_password


class User(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(
        auto_created=True,
        primary_key=True,
        verbose_name="ID",
    )

    password = models.CharField(
        verbose_name="senha", max_length=128, blank=False, null=False
    )

    email = models.EmailField(
        unique=True, max_length=254, blank=False, null=False, db_index=True
    )

    is_email_verified = models.BooleanField(
        verbose_name="email foi verificado",
        default=False,
        null=False,
    )

    first_name = models.CharField(
        verbose_name="nome", max_length=128, blank=False, null=False
    )

    last_name = models.CharField(
        verbose_name="sobrenome", max_length=254, blank=False, null=False
    )

    is_staff = models.BooleanField(
        verbose_name="é da equipe de desenvolvimento",
        default=False,
        null=False,
        help_text="Designa se o usuário pode efetuar o login neste área de administração.",
    )

    is_active = models.BooleanField(
        verbose_name="conta está ativa",
        default=True,
        null=False,
    )

    created_at = models.DateTimeField(
        verbose_name="data do cadastro",
        auto_now_add=True,
        editable=False,
    )

    last_login = models.DateTimeField(
        verbose_name="data do útimo login",
        blank=True,
        null=True,
    )

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        managed = True
        verbose_name = "usuário"
        verbose_name_plural = "usuários"

    def __str__(self):
        return f"{self.fullname} #{self.id}"

    @property
    def fullname(self):
        fullname = "%s %s" % (self.first_name, self.last_name)
        return fullname.strip()

    def send_email(self, subject, html_message, fail_silently=False, from_email=None):
        logging.info(
            f'Sending email to "{self.email}". Subject: "{subject}". Message: "{html_message}"'
        )

        if from_email is None:
            from_email = settings.DEFAULT_FROM_EMAIL

        if not settings.DEBUG:
            threading.Thread(
                target=send_mail,
                kwargs={
                    "subject": subject,
                    "html_message": html_message,
                    "recipient_list": [self.email],
                    "fail_silently": fail_silently,
                    "from_email": from_email,
                    "message": None,
                    "from_email": None,
                },
            ).start()


class CustomGroup(Group):
    class Meta:
        proxy = True
        verbose_name = "grupo"
        verbose_name_plural = "grupos"


class CustomPermission(Permission):
    class Meta:
        proxy = True
        verbose_name = "permissão"
        verbose_name_plural = "permissões"
