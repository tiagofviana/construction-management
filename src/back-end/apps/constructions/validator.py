import re
from django.core.exceptions import ValidationError
from django.utils.deconstruct import deconstructible

HEX_COLOR_PATTERN = re.compile(r"^#[0-9A-Fa-f]{6}$")

COORD = r"\d+(?:\.\d+)?\s\d+(?:\.\d+)?"

SVG_PATH_PATTERN = re.compile(
    rf"^M {COORD}"  # M x y
    rf"(?: L {COORD}"  # L x y
    rf"| C {COORD} {COORD} {COORD})*$"  # C x1 y1 x2 y2 x y
)


def validate_hex_color(value):
    if not HEX_COLOR_PATTERN.fullmatch(value):
        raise ValidationError(
            "Informe uma cor hexadecimal válida.",
            code="invalid_hex_color",
        )


def validate_position(value):
    if value < 0:
        raise ValidationError("A posição deve ser maior ou igual a 0.")


def validate_rotation(value):
    if value < 0 or value > 360:
        raise ValidationError("A rotação deve estar entre 0 e 360.")


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


@deconstructible
class SVGViewBoxValidator:
    """
    Validate the `viewBox` attribute, which must contain exactly 4 numbers:
    "min-x min-y width height", separated by spaces.
    All values must be positive (>= 0).
    """

    message = "ViewBox inválido. Use o formato 'min-x min-y width height', ex.: '0 0 1024 768'."
    code = "invalid_view_box"

    def __call__(self, value):
        parts = value.strip().split()

        if len(parts) != 4:
            raise ValidationError(self.message, code=self.code)

        try:
            min_x, min_y, width, height = (float(p) for p in parts)
        except ValueError:
            raise ValidationError(self.message, code=self.code)

        if width < 0 or height < 0 or min_x < 0 or min_y < 0:
            raise ValidationError(
                "Os valores da viewBox devem ser maiores que zero.",
                code="invalid_dimensions",
            )

    def __eq__(self, other):
        return isinstance(other, SVGViewBoxValidator)
