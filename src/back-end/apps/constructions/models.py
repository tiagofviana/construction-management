from django.core.cache import cache
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinValueValidator
from svgpathtools import parse_path
from apps.core import models as core_models
from . import validator

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
        height=512,
        null=True,
        blank=True,
    )

    name = models.CharField(
        verbose_name="nome",
        max_length=100,
        null=False,
        blank=False,
        db_index=True,
    )

    address = models.TextField(
        verbose_name="endereço",
        null=False,
        blank=False,
        db_index=True,
    )

    class Meta:
        managed = True
        verbose_name = "Construção"
        verbose_name_plural = "Construções"

    def __str__(self):
        return self.name


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

    class Meta:
        managed = True
        constraints = [
            models.UniqueConstraint(
                fields=["construction", "user"], name="unique_employee"
            )
        ]
        verbose_name = "funcionário"
        verbose_name_plural = "funcionários"


class Floor(models.Model):
    id = models.AutoField(
        auto_created=True,
        primary_key=True,
        verbose_name="ID",
    )

    name = models.CharField(
        verbose_name="nome",
        max_length=100,
        null=False,
        blank=False,
        db_index=True,
    )

    construction = models.ForeignKey(
        Construction,
        on_delete=models.CASCADE,
        verbose_name="construção",
        null=False,
        blank=False,
        db_index=True,
    )

    class Meta:
        managed = True
        verbose_name = "piso"
        verbose_name_plural = "pisos"

    def __str__(self):
        return f"{self.name}"


class Room(models.Model):
    id = models.UUIDField(
        primary_key=True,
        unique=True,
        editable=False,
        verbose_name="UUID",
        default=core_models.UniqueUUIDGenerator("constructions", "Room"),
    )

    floor = models.ForeignKey(
        Floor,
        on_delete=models.CASCADE,
        verbose_name="piso",
        null=False,
        blank=False,
        db_index=True,
    )

    svg_path = models.TextField(
        verbose_name="SVG path",
        help_text="Valor do atributo 'd' do elemento <path>.",
        validators=[validator.SVGPathValidator()],
        null=False,
        blank=False,
    )

    svg_view_box = models.CharField(
        verbose_name="SVG viewBox",
        max_length=64,
        help_text="Valor do atributo 'viewBox' (ex.: '0 0 1024 768').",
        validators=[validator.SVGViewBoxValidator()],
        null=False,
        blank=True,
    )

    name = models.CharField(
        verbose_name="nome",
        max_length=100,
        null=False,
        blank=False,
        db_index=True,
    )

    description = models.TextField(
        verbose_name="descrição",
        max_length=256,
        null=False,
        blank=False,
        db_index=True,
    )

    area = models.FloatField(
        verbose_name="área (m²)",
        help_text="Área em metros quádrados.",
        validators=[MinValueValidator(0.0)],
    )

    color = models.CharField(
        verbose_name="cor",
        max_length=7,
        null=False,
        blank=False,
        db_index=True,
        validators=[validator.validate_hex_color],
    )

    position_x = models.FloatField(
        verbose_name="posição X",
        default=0.0,
        validators=[validator.validate_position],
    )

    position_y = models.FloatField(
        verbose_name="posição Y",
        default=0.0,
        validators=[validator.validate_position],
    )

    rotation = models.FloatField(
        verbose_name="rotação",
        default=0.0,
        help_text="Rotação em graus (0-360).",
        validators=[validator.validate_rotation],
    )

    def save(self, *args, **kwargs):
        self._update_svg_view_box()
        super().save(*args, **kwargs)

    def _update_svg_view_box(self):
        if not self.svg_path:
            return
        path = parse_path(self.svg_path)

        xmin, xmax, ymin, ymax = path.bbox()
        width = xmax - xmin
        height = ymax - ymin

        viewbox = f"{xmin:.2f} {ymin:.2f} {width:.2f} {height:.2f}"
        self.svg_view_box = viewbox

    class Meta:
        managed = True
        verbose_name = "cômodo"
        verbose_name_plural = "cômodos"

    def __str__(self):
        return f"{self.name}"
