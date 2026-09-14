import logging
from django.core.cache import cache
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
                self.permissions.append({"codename": codename, "name": name})

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

    def _to_create_codename(self, construction: models.Construction) -> list:
        # Creates permission where codename doest no exists
        to_create = []
        perms_keys = set(
            models.ConstructionPermission.objects.filter(
                construction=construction
            ).values_list("codename", flat=True)
        )

        for item in self.permissions:
            if item["codename"] not in perms_keys:
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

    def _to_update_name(self, construction: models.Construction) -> list:
        # Updates permission name
        to_update = []
        perms = models.ConstructionPermission.objects.filter(construction=construction)

        for item in perms:
            permission = next(
                (p for p in self.permissions if p["codename"] == item.codename), None
            )

            if permission == None:
                raise ValueError(
                    f'Could not find permission "{item.codename}" in PermissionUpdater'
                )

            if permission["name"] == item.name:
                continue

            logging.info(
                f'Preparing to update the construction permission name "{item["codename"]}" of {construction.name} #{construction.id}. Current: "{item['name']}" to "{permission['name']}"'
            )

            item.name = permission["name"]
            to_update.append(item)

        return to_update

    def _to_delete(self) -> QuerySet:
        q_objects = Q()
        for item in self.permissions:
            q_objects |= Q(codename=item["codename"])

        to_delete = models.ConstructionPermission.objects.exclude(q_objects)

        for item in to_delete:
            logging.info(
                f'Preparing to delete the construction permission  "{item.codename}" of {item.construction.name} #{item.construction.id}.'
            )

        return to_delete

    def update(self):
        all_constructions = models.Construction.objects.all()
        with transaction.atomic():
            for construction in all_constructions:
                # Create the new one
                to_create = self._to_create_codename(construction)
                if to_create:
                    models.ConstructionPermission.objects.bulk_create(
                        to_create, ignore_conflicts=False
                    )

                logging.info(f"Created {len(to_create)} construction permissions")

                # Removes
                to_delete = self._to_delete()
                to_delete_len = len(to_delete)
                if to_delete:
                    to_delete.delete()

                logging.info(f"Removed {to_delete_len} construction permissions")

                to_update = self._to_update_name(construction)
                if to_update:
                    models.ConstructionPermission.objects.bulk_update(
                        to_update, ignore_conflicts=False
                    )

                logging.info(f"Updated {len(to_update)} construction permissions")
