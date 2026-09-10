from django.db import models
from django.contrib.auth import get_user_model
from apps.core import models as core_models

User = get_user_model()


class Construction(models.Model):
    id = models.AutoField(
        auto_created=True,
        primary_key=True,
        verbose_name="ID",
    )

    photo = core_models.CustomImageField(
        verbose_name="Foto",
        subdir="uploads/images/contruction/photo/",
        width=512,
        height=288,  # 16/9
        null=True,
        blank=True,
    )

    name = models.CharField(
        verbose_name="nome",
        max_length=100,
        null=False,
        blank=False,
    )

    address = models.TextField(
        verbose_name="endereço",
        null=False,
        blank=False,
    )

    class Meta:
        managed = True
        verbose_name = "Construção"
        verbose_name_plural = "Construções"

    def __str__(self):
        return f"{self.name} #{self.id}"


class Employee(models.Model):
    id = models.AutoField(
        auto_created=True,
        primary_key=True,
        verbose_name="ID",
    )

    construction = models.ForeignKey(
        Construction,
        on_delete=models.CASCADE,
        verbose_name="construção",
        null=False,
        blank=False,
        db_index=True,
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name="usuário",
        null=False,
        blank=False,
        db_index=True,
    )

    is_admin = models.BooleanField(
        verbose_name="é administrador geral",
        default=False,
        help_text="Designa que este funcionário tem todas as permissões da construção sem atribuí-las explicitamente",
    )

    class Meta:
        managed = True
        constraints = [
            models.UniqueConstraint(
                fields=["construction", "user"], name="unique_construction_employee"
            )
        ]
        verbose_name = "funcionário"
        verbose_name_plural = "funcionários"

    def __str__(self):
        return f"{self.construction} <-> {self.user}"
