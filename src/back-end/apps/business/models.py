from django.db import models
from django.core.cache import cache
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


class ConstructionPermission(models.Model):
    id = models.AutoField(
        auto_created=True,
        primary_key=True,
        verbose_name="ID",
    )

    construction = models.ForeignKey(
        Construction,
        verbose_name="construção",
        on_delete=models.CASCADE,
        null=False,
        blank=False,
        db_index=True,
    )

    name = models.CharField(
        verbose_name="nome",
        max_length=255,
        null=False,
        blank=False,
    )

    codename = models.CharField(
        verbose_name="codinome",
        max_length=100,
        null=False,
        blank=False,
        db_index=True,
    )

    class Meta:
        managed = True
        constraints = [
            models.UniqueConstraint(
                fields=["construction", "codename"],
                name="unique-construction_permission",
            )
        ]
        verbose_name = "permissão"
        verbose_name_plural = "permissões"

    def __str__(self):
        return f"{self.construction.name} — {self.codename}"


class ConstructionGroup(models.Model):
    id = models.AutoField(
        auto_created=True,
        primary_key=True,
        verbose_name="ID",
    )

    construction = models.ForeignKey(
        Construction,
        verbose_name="construção",
        on_delete=models.CASCADE,
        null=False,
        blank=False,
        db_index=True,
    )

    name = models.CharField(
        verbose_name="nome",
        max_length=255,
        null=False,
        blank=False,
    )

    permissions = models.ManyToManyField(
        ConstructionPermission,
        verbose_name="permissões",
        help_text="Permissões específicas para o grupo.",
        blank=True,
    )

    class Meta:
        managed = True
        constraints = [
            models.UniqueConstraint(
                fields=["construction", "name"], name="unique-construction_name"
            )
        ]
        verbose_name = "grupo"
        verbose_name_plural = "grupos"

    def __str__(self):
        return f"{self.construction.name} — {self.name}"


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

    is_active = models.BooleanField(
        verbose_name="funcionário está ativo",
        default=True,
        null=False,
    )

    is_admin = models.BooleanField(
        verbose_name="é administrador geral",
        default=False,
        help_text="Designa que este funcionário tem todas as permissões da construção sem atribuí-las explicitamente",
    )

    permissions = models.ManyToManyField(
        ConstructionPermission,
        verbose_name="permissões da construção",
        help_text="Permissões específicas para o funcionário.",
        blank=True,
        db_index=True,
    )

    groups = models.ManyToManyField(
        ConstructionGroup,
        verbose_name="grupos da construção",
        help_text="Grupos que o funcionário faz parte.",
        blank=True,
        db_index=True,
    )

    class Meta:
        managed = True
        constraints = [
            models.UniqueConstraint(
                fields=["construction", "user"], name="unique-construction_user"
            )
        ]
        verbose_name = "funcionário"
        verbose_name_plural = "funcionários"

    def __str__(self):
        return f"{self.construction} — {self.user}"

    def _get_cache_key(self) -> str:
        return f"business:employee_{self.pk}:permissions"

    def has_permission(self, codename: str, use_cache=True):
        if self.is_admin:
            return True

        permissions = self.get_all_permissions(use_cache=use_cache)
        exists = any(item["codename"] == codename for item in permissions)
        return exists

    def get_all_permissions(self, use_cache=True) -> list:
        key = self._get_cache_key()
        cached = cache.get(key)
        if use_cache and cached is not None:
            return cached

        employee_perms = self.permissions.values("codename", "name").all()
        employee_groups = (
            self.groups.values("permissions__codename", "permissions__name")
            .annotate(
                codename=models.F("permissions__codename"),
                name=models.F("permissions__name"),
            )
            .values("name", "codename")
            .all()
        )

        permissions = list(employee_perms) + list(employee_groups)
        unique = [
            dict(item) for item in {frozenset(perm.items()) for perm in permissions}
        ]

        cache.set(key, tuple(unique), 10 * 60)  # 10 minutes
        return unique

    def delete_perms_cache(self):
        cache.delete(self._get_cache_key())
