import logging, hashlib
from django import http
from django.conf import settings
from django.core.cache import cache
from django.db.models import QuerySet
from django.views import View
from django.views.generic.edit import FormView
from apps.users.models import User
from apps.constructions import models as constructions_models
from apps.api import responses
from .. import mixins

from django.views.generic import ListView, DetailView


class ConstructionsListView(mixins.AccountVerificationMixin, View):
    http_method_names = ["get"]

    def get(self, *args, **kwargs) -> http.JsonResponse:
        data = self.get_contructions()

        return responses.Success(data, safe=False)

    def get_queryset(self) -> QuerySet[constructions_models.Employee]:
        user: User = self.request.user
        return constructions_models.Employee.objects.filter(user=user).select_related(
            "construction"
        )

    def get_contructions(self):
        employees = self.get_queryset()
        data = list()

        for item in employees:
            construction = item.construction
            photo_url = ""

            if construction.photo:
                photo_url = f"/media/{construction.photo}"

            data.append(
                {
                    "employeeId": item.id,
                    "name": construction.name,
                    "address": construction.address,
                    "photoUrl": photo_url,
                }
            )

        return data
