import logging
from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.db.models import Q, QuerySet
from . import models


class PermissionsUpdater:
    permissions = []

    def __init__(self) -> list:
        contents = ContentType.objects.all()
        for content in contents:
            model = content.model_class()
            perms = getattr(model, "construction_permissions", [])

            if perms and not self._is_valid(perms):
                raise TypeError(
                    f'Expected a list of (str, str) tuples for "custom" in Model {model.__name__}.ConstructionPermissions'
                )

            for codename, name in perms:
                self.permissions.append(
                    {"codename": codename, "name": name, "content": content}
                )

        self._check_repeated()

    def _is_valid(self, perms) -> bool:
        if not isinstance(perms, list):
            return False

        for item in perms:
            if not isinstance(item, tuple) or len(item) != 2:
                return False
            if not all(isinstance(elem, str) for elem in item):
                return False

        return True

    def _check_repeated(self):
        seen_codename = set()
        seen_name = set()

        for item in self.permissions:
            codename = item["codename"]
            name = item["name"]

            if codename in seen_codename:
                raise ValueError(f"Reapeated permission codename: { codename }")

            if name in seen_name:
                raise ValueError(f"Reapeated permission name: { name }")

            seen_codename.add(codename)
            seen_name.add(name)

    def create(self, instance: models.ConstructionPermission):
        to_create = []
        for item in self.permissions:
            to_create.append(
                models.ConstructionPermission(
                    construction=instance,
                    codename=item["codename"],
                    name=item["name"],
                )
            )

        if not to_create:
            return

        with transaction.atomic():
            models.ConstructionPermission.objects.bulk_create(
                to_create, ignore_conflicts=False
            )

    def _to_create(self, construction: models.Construction) -> list:
        to_create = []

        perms_keys = set(
            models.ConstructionPermission.objects.filter(
                construction=construction
            ).values_list("codename")
        )

        for item in self.permissions:
            key = (item["codename"], item["content"].id)

            if key not in perms_keys:
                logging.info(
                    f'Preparing to create the construction permission  "{item["codename"]}" of {construction.name} #{construction.id}.'
                )

                perm = models.ConstructionPermission(
                    construction=construction,
                    codename=item["codename"],
                    name=item["name"],
                )

                to_create.append(perm)

        return to_create

    def _to_delete_queryset(self) -> QuerySet:
        q_objects = Q()
        for item in self.permissions:
            q_objects |= Q(
                codename=item["codename"],
                name=item["name"],
            )

        to_delete = models.ConstructionPermission.objects.exclude(q_objects)

        for item in to_delete:
            logging.info(
                f'Preparing to delete the construction permission  "{item.codename}" of {item.construction.name} #{item.construction.id}.'
            )

        return to_delete

    def update(self):
        all_constructions = models.Construction.objects.all()
        to_create = []

        for construction in all_constructions:
            to_create += self._to_create(construction)

        with transaction.atomic():
            if to_create:
                models.ConstructionPermission.objects.bulk_create(
                    to_create, ignore_conflicts=False
                )

                logging.info(f"Created {len(to_create)} construction permissions")

            to_delete = self._to_delete_queryset()
            if to_delete:
                logging.info(f"Removed {len(to_delete)} construction permissions")
                to_delete.delete()
