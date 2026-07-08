from django.apps import AppConfig


class ConstructionConfig(AppConfig):
    name = "apps.constructions"
    verbose_name = "Construção"

    def ready(self):
        # This will run the signals
        import apps.constructions.signals
