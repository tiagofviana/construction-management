from django.forms import widgets


class ObjectSVGPathInputWidget(widgets.Textarea):
    template_name = "inventory/widgets/object_svg_editor.html"

    class Media:
        css = {
            "all": ("core/_css/tailwind/output.css", "core/_css/admin.css"),
        }
