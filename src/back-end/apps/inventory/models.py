import logging
from django.db import models
from django.contrib.postgres.search import SearchVectorField, SearchVector
from django.contrib.postgres.indexes import GinIndex
from apps.core import models as core_models
from apps.maps import models as maps_models
from . import validators, widgets


class CustomSVGEditorField(models.TextField):
    def formfield(self, **kwargs):
        kwargs["widget"] = widgets.ObjectSVGPathInputWidget()
        return super().formfield(**kwargs)


class Category(models.Model):
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
    )

    description = models.TextField(
        verbose_name="descrição",
        max_length=256,
        null=False,
        blank=False,
    )

    svg = CustomSVGEditorField(
        verbose_name="SVG",
        null=False,
        blank=False,
    )

    class Meta:
        managed = True
        verbose_name = "categoria"
        verbose_name_plural = "categorias"

    def __str__(self):
        return self.name


class Attribute(models.Model):
    class DataType(models.IntegerChoices):
        INTEGER = 1, "Inteiro"
        DECIMAL = 2, "Decimal"
        BOOLEAN = 3, "Booleano"
        TEXT = 4, "Texto"
        SELECT = 5, "Seleção"

    id = models.AutoField(
        auto_created=True,
        primary_key=True,
        verbose_name="ID",
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="attributes",
        db_index=True,
    )

    label = models.CharField(
        verbose_name="rótulo",
        help_text="Nome da característica em português.",
        max_length=32,
        null=False,
        blank=False,
        db_index=False,
    )

    name = models.SlugField(
        verbose_name="nome",
        help_text="Identificador da característica em inglês (camel case).",
        max_length=32,
        null=False,
        blank=False,
    )

    help_text = models.TextField(
        verbose_name="texto de ajuda",
        max_length=255,
        null=True,
        blank=True,
    )

    type = models.PositiveSmallIntegerField(
        verbose_name="tipo",
        choices=DataType,
        null=False,
        blank=False,
    )

    is_required = models.BooleanField(
        verbose_name="é obrigatório",
        default=False,
        null=False,
        blank=True,
    )

    options = models.JSONField(
        verbose_name="opções",
        help_text='Opções cajo o tipo seja uma "Seleção"',
        default=list,
        null=False,
        blank=True,
    )

    validation = models.JSONField(
        default=dict,
        null=False,
        blank=True,
    )

    created_at = models.DateTimeField(
        verbose_name="data do cadastro",
        auto_now_add=True,
        editable=False,
    )

    class Meta:
        managed = True
        constraints = [
            models.UniqueConstraint(
                fields=["category", "label"],
                name="unique_category_label_attribute",
            )
        ]
        verbose_name = "atributo"
        verbose_name_plural = "atributos"

    def _str_(self):
        return f"{self.category.name} → {self.label}"


class Item(models.Model):
    id = models.AutoField(
        auto_created=True,
        primary_key=True,
        verbose_name="ID",
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        verbose_name="categoria",
        null=False,
        blank=False,
        db_index=True,
    )

    name = models.CharField(
        verbose_name="nome",
        max_length=100,
        null=False,
        blank=False,
    )

    description = models.TextField(
        help_text="Este campo é gerado automaticamente.",
        verbose_name="descrição",
        blank=True,
        null=False,
        editable=False,
    )

    svg = CustomSVGEditorField(
        verbose_name="SVG",
        null=True,
        blank=True,
    )

    attributes = models.JSONField(
        verbose_name="atributos",
        null=False,
        blank=False,
    )

    search_vector = SearchVectorField(
        verbose_name="vetor de pesquisa",
        help_text='Campo gerado automáticamente para pesquisas "full text search". Baseado na descrição e nas palavras-chave.',
        null=False,
        blank=True,
        editable=False,
    )

    created_at = models.DateTimeField(
        verbose_name="data do cadastro",
        auto_now_add=True,
        editable=False,
    )

    class Meta:
        managed = True
        verbose_name = "item"
        verbose_name_plural = "itens"
        indexes = [
            GinIndex(
                fields=["attributes"],
                name="inventory_item_attributes_gin",
                opclasses=["jsonb_path_ops"],
            ),
            GinIndex(
                fields=["search_vector"],
                name="inventory_item_sv_gin",
                opclasses=["tsvector_ops"],
            ),
            GinIndex(
                fields=["name", "description"],
                name="inventory_item_trgm_gin",
                opclasses=["gin_trgm_ops", "gin_trgm_ops"],
            ),
        ]

    def __str__(self):
        return f"{self.name} #{self.id}"

    def clean(self):
        super().clean()
        validators.RoomObjectValidator(self).validate()

    def save(self, *args, **kwargs):
        self.full_clean()

        if not self.description:
            self.generate_description()

        if self.search_vector is None:
            self.update_vector()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} #{self.id}"

    def generate_description(self):
        descriptions = []

        for attribute in self.category.attributes.all():
            value = self.attributes.get(attribute.name)
            if value is None or value == "":
                continue

            if attribute.type == Attribute.DataType.BOOLEAN:
                value = "Sim" if value else "Não"
            elif isinstance(value, float):
                value = str(value).replace(".", ",")

            descriptions.append(f"{attribute.label} {value}")

        self.description = "; ".join(descriptions)
        return self.description

    def _generate_vector(self):
        vector = SearchVector(
            models.Value(self.name), weight="A", config="portuguese"
        ) + SearchVector(
            models.Value(self.description), weight="B", config="portuguese"
        )

        return vector

    def update_vector(self):
        self.search_vector = self._generate_vector()
        logging.info(f"Updating product #{self.id}. Vector: {self.search_vector}.")
        self.save(
            update_fields=[
                "search_vector",
            ]
        )


class RoomItem(models.Model):
    id = models.UUIDField(
        primary_key=True,
        unique=True,
        verbose_name="UUID",
        default=core_models.UniqueUUIDGenerator("inventory", "RoomItem"),
    )

    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        verbose_name="item",
        null=False,
        blank=False,
        db_index=True,
    )

    room = models.ForeignKey(
        maps_models.Room,
        on_delete=models.CASCADE,
        verbose_name="cômodo",
        null=False,
        blank=False,
        db_index=True,
    )

    position_x = models.FloatField(
        verbose_name="posição X",
        default=0.0,
        validators=[validators.validate_position],
    )

    position_y = models.FloatField(
        verbose_name="posição Y",
        default=0.0,
        validators=[validators.validate_position],
    )

    rotation = models.FloatField(
        verbose_name="rotação",
        default=0.0,
        help_text="Rotação em graus (0-360).",
        validators=[validators.validate_rotation],
    )

    created_at = models.DateTimeField(
        verbose_name="data do cadastro",
        auto_now_add=True,
        editable=False,
    )

    class Meta:
        managed = True
        verbose_name = "item no cômodo"
        verbose_name_plural = "itens nos cômodos"

    def _str_(self):
        return f"{self.room} → {self.item}"
