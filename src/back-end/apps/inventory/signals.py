import logging
from django.apps import apps
from django.db import transaction
from django.db.models import signals
from django.dispatch import receiver
from apps.core import utils as core_utils
from . import models

# ITEM SIGNALS


@receiver(signals.post_save, sender=models.Item)
def update_item_fields(
    sender, instance: models.Item, update_fields: frozenset, **kwargs
):

    if update_fields == frozenset({"search_vector", "description"}):
        return

    instance.update_vector()
    instance.update_description()

    with transaction.atomic():
        instance.save(update_fields=["search_vector", "description"])
        logging.info(f"Updated item #{instance.id}. Vector: {instance.search_vector}.")
        logging.info(
            f"Updated item #{instance.id}. Description: {instance.description}."
        )
