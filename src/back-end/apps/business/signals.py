from django.apps import apps
from django.db.models import signals
from django.dispatch import receiver
from . import models, permissions


@receiver(signals.post_save, sender=models.Construction)
def create_construction_permissions(
    sender, instance: models.Construction, created, **kwargs
):
    if not created:
        return

    permissions.PermissionsUpdater().create(instance)


@receiver(signals.post_migrate, sender=apps.get_app_config("business"))
def update_construction_permissions(sender, **kwargs):
    permissions.PermissionsUpdater().update()
