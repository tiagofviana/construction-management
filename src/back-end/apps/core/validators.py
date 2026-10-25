import re
from django.core.exceptions import ValidationError
from django.utils.deconstruct import deconstructible

COORD = r"\d+(?:\.\d+)?\s\d+(?:\.\d+)?"

SVG_PATH_PATTERN = re.compile(
    rf"^M {COORD}"  # M x y
    rf"(?: L {COORD}"  # L x y
    rf"| C {COORD}, {COORD}, {COORD})*$"  # C x1 y1 x2 y2 x y
)


@deconstructible
class SVGPathValidator:
    """
    Validates the value of the `d` attribute of a `<path>` uses only the
    M (move), L (line), and C (curve) commands.

    Accepts lowercase variants and multiple concatenated commands,
    e.g., "M10 10 L20 20 C30 30 40 40 50 50".
    """

    message = "Caminho SVG inválido. Use o formato 'M x, y', 'L x, y' e C x1, y1 x2, y2 x, y', com coordenadas positivas."

    code = "invalid_svg_path"

    def __call__(self, value):
        value = value.strip()

        if not value:
            raise ValidationError("O caminho SVG não pode estar vazio.", code="empty")

        if not SVG_PATH_PATTERN.match(value):
            raise ValidationError(self.message, code=self.code)

    def __eq__(self, other):
        return isinstance(other, SVGPathValidator)
