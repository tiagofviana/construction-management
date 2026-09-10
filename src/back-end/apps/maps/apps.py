from django.apps import AppConfig


class MapsConfig(AppConfig):
    name = "apps.maps"
    verbose_name = "Mapas"

    def ready(self):
        # This will run the signals
        import apps.maps.signals
