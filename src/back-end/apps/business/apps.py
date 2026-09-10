from django.apps import AppConfig


class BusinessConfig(AppConfig):
    name = "apps.business"
    verbose_name = "Negócio"

    def ready(self):
        # This will run the signals
        import apps.business.signals
