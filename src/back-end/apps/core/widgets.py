from django.forms import widgets


class JsonInputWidget(widgets.Textarea):
    template_name = "core/widgets/json_editor.html"

    class Media:
        css = {
            "all": ("core/_css/tailwind/output.css", "core/_css/admin.css"),
        }


class ImageCropperInputWidget(widgets.ClearableFileInput):
    template_name = "core/widgets/image_cropper.html"

    class Media:
        css = {
            "all": ("core/_css/tailwind/output.css", "core/_css/admin.css"),
        }
