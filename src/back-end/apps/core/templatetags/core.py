from django import template


register = template.Library()


class StripNode(template.Node):
    def __init__(self, nodelist: template.NodeList):
        self.nodelist = nodelist

    def render(self, context: template.Context):
        data = self.nodelist.render(context)
        return data.strip()

    @staticmethod
    @register.tag("strip")
    def add_once(parser: template.base.Parser, token: template.base.Token):
        nodelist = parser.parse(parse_until=("endstrip",))
        parser.delete_first_token()
        return StripNode(nodelist)
