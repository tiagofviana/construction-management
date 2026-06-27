from django import http
from django.shortcuts import redirect


def redirect_404(*args, **kwargs) -> http.HttpResponseRedirect:
    return redirect("/404")
