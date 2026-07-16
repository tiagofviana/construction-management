from django.forms import widgets


class ImageCropperInputWidget(widgets.ClearableFileInput):
    template_name = "core/widgets/image_cropper.html"

    class Media:
        css = {
            "all": ("core/_css/tailwind/output.css",),
        }
