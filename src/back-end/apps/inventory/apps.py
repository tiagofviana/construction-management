from django.apps import AppConfig


class InventoryConfig(AppConfig):
    name = "apps.inventory"
    verbose_name = "Inventário dos cômodos"

    def ready(self):
        # This will run the signals
        import apps.inventory.signals
