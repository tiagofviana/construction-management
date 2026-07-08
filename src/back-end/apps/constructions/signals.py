from django.db.models import signals
from django.dispatch import receiver
from apps.constructions import models
from apps.core import utils as core_utils


@receiver(signals.pre_delete, sender=models.Construction)
def remove_contruction_photo(sender, instance: models.Construction, **kwargs):
    deleter = core_utils.CustomImageFieldDeleter("photo", instance)
    deleter.start()
