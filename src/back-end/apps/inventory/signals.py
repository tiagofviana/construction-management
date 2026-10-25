from django.apps import apps
from django.db import transaction
from django.db.models import signals
from django.dispatch import receiver
from apps.core import utils as core_utils
from . import models

# ITEM SIGNALS


@receiver(signals.post_save, sender=models.Item)
def save_item_search_vector(
    sender, instance: models.Item, update_fields: frozenset, **kwargs
):
    if update_fields != frozenset({"search_vector"}):
        instance.update_vector()
