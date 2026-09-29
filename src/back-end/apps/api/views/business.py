import logging
from django import http
from django.conf import settings
from django.core.cache import cache
from django.db import transaction
from django.db.models import Count, QuerySet, Q, Value, CharField
from django.db.models.functions import Concat
from django.views import View
from django.views.generic import CreateView, FormView, UpdateView
from apps.users.models import User
from apps.business import models as business_models, forms as business_forms
from apps.maps import models as maps_models
from apps.api import responses
from .. import mixins


class ConstructionsDataView(mixins.AccountVerificationMixin, View):
    http_method_names = ["get"]

    def get(self, *args, **kwargs) -> http.JsonResponse:
        data = self.get_contructions()
        return responses.Success(data)

    def get_queryset(self) -> QuerySet[business_models.Employee]:
        user: User = self.request.user
        return business_models.Employee.objects.filter(
            user=user, is_active=True
        ).select_related("construction")

    def get_contructions(self) -> list:
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


class DashboardDataView(
    mixins.AccountVerificationMixin, mixins.EmployeePermissionMixin, View
):
    http_method_names = ["get"]

    def get(self, *args, **kwargs) -> http.JsonResponse:
        data = {
            "construction": self.construction_data(),
            "atlas": self.atlas_data(),
            "employees": self.employees_data(),
        }

        return responses.Success(data)

    def construction_data(self) -> dict:
        employee = self.get_employee_queryset()
        construction = employee.construction
        photo_url = ""

        if construction.photo:
            photo_url = f"/media/{construction.photo}"

        return {
            "name": construction.name,
            "address": construction.address,
            "photoUrl": photo_url,
        }

    def atlas_data(self) -> list:
        employee = self.get_employee_queryset()
        construction = employee.construction
        has_permission = employee.has_permission("can_view_floor", use_cache=True)
        result = []

        if has_permission:
            result = list(
                maps_models.Floor.objects.filter(construction=construction)
                .annotate(roomCount=Count("room"))
                .values("name", "roomCount")
                .order_by("order")
            )

        return result

    def employees_data(self) -> list:
        result = {}
        employee = self.get_employee_queryset()
        employees = business_models.Employee.objects.filter(
            construction=employee.construction, is_active=True
        )

        has_employee_permission = employee.has_permission("can_view_employees")
        if has_employee_permission:
            result["employeesCount"] = employees.count()
            result["adminsCount"] = employees.filter(is_admin=True).count()

        has_group_permission = employee.has_permission("can_view_constructionGroups")
        if has_group_permission:
            result["groupsCount"] = business_models.ConstructionGroup.objects.filter(
                construction=employee.construction
            ).count()

        return result


class PermissionsDataView(
    mixins.AccountVerificationMixin, mixins.EmployeePermissionMixin, View
):
    http_method_names = ["get"]

    def get(self, *args, **kwargs) -> http.JsonResponse:
        employee = self.get_employee_queryset()
        data = {"permissions": []}

        if not employee.is_admin:
            data["permissions"] = employee.get_all_permissions()
        else:
            data["permissions"] = [
                {
                    "codename": "is_admin",
                    "name": "É administrador",
                }
            ]

        return responses.Success(data)


class GroupsDataView(
    mixins.AccountVerificationMixin, mixins.EmployeePermissionMixin, View
):
    http_method_names = ["get"]

    def get(self, *args, **kwargs) -> http.JsonResponse:
        employee = self.get_employee_queryset()
        has_permission = employee.has_permission("can_view_constructionGroups")

        if not has_permission:
            return responses.Forbidden(
                request=self.request,
                data={
                    "detail": "Não possui a permissão necessária.",
                    "code": "missing_permission",
                },
            )

        data = {"groups": self.get_groups()}

        return responses.Success(data)

    def get_groups(self) -> list:
        return [
            {
                "id": group.id,
                "name": group.name,
                "permissions": list(group.permissions.values("name", "id")),
            }
            for group in self.get_queryset()
        ]

    def get_queryset(self) -> QuerySet[business_models.ConstructionGroup]:
        employee = self.get_employee_queryset()
        return (
            business_models.ConstructionGroup.objects.filter(
                construction=employee.construction
            )
            .prefetch_related("permissions")
            .order_by("name")
        )


class GroupsDeleteView(
    mixins.AccountVerificationMixin, mixins.EmployeePermissionMixin, View
):
    http_method_names = ["get"]

    def get(self, *args, **kwargs) -> http.JsonResponse:
        employee = self.get_employee_queryset()
        has_permission = employee.has_permission("can_edit_constructionGroups")

        if not has_permission:
            return responses.Forbidden(
                request=self.request,
                data={
                    "detail": "Não possui a permissão necessária.",
                    "code": "missing_permission",
                },
            )

        group_id = kwargs.get("group_id", None)
        business_models.ConstructionGroup.objects.get(
            construction=employee.construction, id=group_id
        ).delete()

        return responses.Success()


class ConstructionPermissionsDataView(
    mixins.AccountVerificationMixin, mixins.EmployeePermissionMixin, View
):
    http_method_names = ["get"]

    def get(self, *args, **kwargs) -> http.JsonResponse:
        employee = self.get_employee_queryset()

        has_permission = employee.has_permission("can_view_constructionGroups")
        if not has_permission:
            return responses.Forbidden(
                request=self.request,
                data={
                    "detail": "Não possui a permissão necessária.",
                    "code": "missing_permission",
                },
            )

        data = {"permissions": list(self.get_queryset().values("name", "id"))}
        return responses.Success(data)

    def get_queryset(self) -> QuerySet[business_models.ConstructionGroup]:
        employee = self.get_employee_queryset()
        return business_models.ConstructionPermission.objects.filter(
            construction=employee.construction
        ).all()


class ConstructionGroupsDataView(
    mixins.AccountVerificationMixin, mixins.EmployeePermissionMixin, View
):
    http_method_names = ["get"]

    def get(self, *args, **kwargs) -> http.JsonResponse:
        employee = self.get_employee_queryset()

        has_permission = employee.has_permission("can_view_constructionGroups")
        if not has_permission:
            return responses.Forbidden(
                request=self.request,
                data={
                    "detail": "Não possui a permissão necessária.",
                    "code": "missing_permission",
                },
            )

        data = {"groups": list(self.get_queryset().values("name", "id"))}
        return responses.Success(data)

    def get_queryset(self) -> QuerySet[business_models.ConstructionGroup]:
        employee = self.get_employee_queryset()
        return business_models.ConstructionGroup.objects.filter(
            construction=employee.construction
        ).all()


class ConstructionGroupCreateView(
    mixins.AccountVerificationMixin, mixins.EmployeePermissionMixin, CreateView
):
    http_method_names = ["post"]
    form_class = business_forms.SaveGroupForm

    def post(self, request: http.HttpRequest, *args, **kwargs):
        employee = self.get_employee_queryset()

        has_permission = employee.has_permission("can_edit_constructionGroups")
        if not has_permission:
            return responses.Forbidden(
                request=self.request,
                data={
                    "detail": "Não possui a permissão necessária.",
                    "code": "missing_permission",
                },
            )

        return super().post(request, *args, **kwargs)

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs["data"] = self.request.POST
        kwargs["construction"] = self.get_employee_queryset().construction
        return kwargs

    def form_valid(self, form: business_forms.SaveGroupForm) -> http.JsonResponse:
        group = form.save()
        employee = self.get_employee_queryset()

        logging.info(
            f'Employee #{employee.id}. Created the construction group #"{group.id}". Permissions: {form.cleaned_data['permissions']}.'
        )
        return responses.Success()

    def form_invalid(self, form: business_forms.SaveGroupForm) -> http.JsonResponse:
        return responses.Error(form.errors)


class ConstructionGroupUpdateView(
    mixins.AccountVerificationMixin, mixins.EmployeePermissionMixin, UpdateView
):
    http_method_names = ["post"]
    form_class = business_forms.SaveGroupForm
    pk_url_kwarg = "group_id"

    def post(self, request: http.HttpRequest, *args, **kwargs):
        employee = self.get_employee_queryset()

        has_permission = employee.has_permission("can_edit_constructionGroups")
        if not has_permission:
            return responses.Forbidden(
                request=self.request,
                data={
                    "detail": "Não possui a permissão necessária.",
                    "code": "missing_permission",
                },
            )

        group_id = kwargs.get(self.pk_url_kwarg)
        if not self.get_queryset().filter(pk=group_id).exists():
            return responses.NotFound(request=request)

        return super().post(request, *args, **kwargs)

    def get_queryset(self):
        employee = self.get_employee_queryset()
        return business_models.ConstructionGroup.objects.filter(
            construction=employee.construction
        )

    def get_form_kwargs(self):
        employee = self.get_employee_queryset()
        kwargs = super().get_form_kwargs()
        kwargs["data"] = self.request.POST
        kwargs["construction"] = employee.construction
        return kwargs

    def form_valid(self, form: business_forms.SaveGroupForm) -> http.JsonResponse:
        group = form.save()
        employee = self.get_employee_queryset()
        permissions: QuerySet = form.cleaned_data["permissions"]

        logging.info(
            f'Employee #{employee.id}. Changed the construction group #"{group.id}". Permissions: {list(permissions.all().values_list('id', flat=True))}.'
        )
        return responses.Success()

    def form_invalid(self, form: business_forms.SaveGroupForm) -> http.JsonResponse:
        return responses.Error(form.errors)


class ConstructionTeamDataView(
    mixins.AccountVerificationMixin, mixins.EmployeePermissionMixin, View
):
    http_method_names = ["get"]

    def get(self, *args, **kwargs) -> http.JsonResponse:
        employee = self.get_employee_queryset()
        has_permission = employee.has_permission("can_view_employees")

        if not has_permission:
            return responses.Forbidden(
                request=self.request,
                data={
                    "detail": "Não possui a permissão necessária.",
                    "code": "missing_permission",
                },
            )

        data = {"employees": self.get_employees()}

        return responses.Success(data)

    def get_employees(self) -> list:
        data = []
        current_employee = self.get_employee_queryset()
        employees_qs = self.get_queryset()

        for employee in employees_qs:
            permissions = []
            groups = []

            if current_employee.has_permission("can_view_employeesPermissions"):
                permissions = list(employee.permissions.values("name", "id"))
                groups = list(employee.groups.values("name", "id"))

            data.append(
                {
                    "id": employee.id,
                    "fullname": employee.user.fullname,
                    "email": employee.user.email,
                    "isAdmin": employee.is_admin,
                    "permissions": permissions,
                    "groups": groups,
                }
            )

        return data

    def get_queryset(self) -> QuerySet[business_models.Employee]:
        employee = self.get_employee_queryset()
        return (
            business_models.Employee.objects.filter(
                construction=employee.construction, is_active=True
            )
            .prefetch_related("permissions", "groups")
            .select_related("user")
            .order_by("-is_admin", "user__first_name", "user__last_name")
        )


class DeactivateEmployeeView(
    mixins.AccountVerificationMixin, mixins.EmployeePermissionMixin, View
):
    http_method_names = ["get"]

    def get(self, *args, **kwargs) -> http.JsonResponse:
        employee = self.get_employee_queryset()
        has_permission = employee.has_permission("can_edit_employeesPermissions")

        if not has_permission:
            return responses.Forbidden(
                request=self.request,
                data={
                    "detail": "Não possui a permissão necessária.",
                    "code": "missing_permission",
                },
            )

        active_employee = self.get_queryset()
        if not active_employee:
            return responses.Unauthorized(
                request=self.request,
                data={
                    "detail": "Funcionário não identificado.",
                    "code": "missing_employee",
                },
            )

        active_employee.is_active = False
        active_employee.save(update_fields=["is_active"])

        return responses.Success()

    def get_queryset(self) -> business_models.Employee | None:
        current_employee = self.get_employee_queryset()
        deactivate_id = self.kwargs["deactivate_id"]

        return (
            business_models.Employee.objects.filter(
                id=deactivate_id,
                construction=current_employee.construction,
                is_active=True,
            )
            .exclude(id=current_employee.id)
            .first()
        )


class SearchNewEmployeeView(
    mixins.AccountVerificationMixin, mixins.EmployeePermissionMixin, View
):
    http_method_names = ["post"]

    def post(self, *args, **kwargs) -> http.JsonResponse:
        employee = self.get_employee_queryset()
        has_permission = employee.has_permission("can_add_employees")

        if not has_permission:
            return responses.Forbidden(
                request=self.request,
                data={
                    "detail": "Não possui a permissão necessária.",
                    "code": "missing_permission",
                },
            )
        data = {"result": self.search()}
        return responses.Success(data)

    def search(self) -> list:
        search = self.request.POST.get("search", "")

        if len(search) < 3:
            return []

        return list(
            User.objects.annotate(
                fullname=Concat(
                    "first_name", Value(" "), "last_name", output_field=CharField()
                )
            )
            .filter(
                Q(fullname__icontains=search) | Q(email__icontains=search),
                is_staff=False,
                is_superuser=False,
                is_email_verified=True,
            )
            .exclude(employee__is_active=True)
            .values("id", "fullname", "email")
        )


class EmployeeCreateView(
    mixins.AccountVerificationMixin, mixins.EmployeePermissionMixin, CreateView
):
    http_method_names = ["post"]
    model = business_models.Employee
    fields = ["user"]

    def post(self, request: http.HttpRequest, *args, **kwargs):
        employee = self.get_employee_queryset()

        has_permission = employee.has_permission("can_add_employees")
        if not has_permission:
            return responses.Forbidden(
                request=self.request,
                data={
                    "detail": "Não possui a permissão necessária.",
                    "code": "missing_permission",
                },
            )

        return super().post(request, *args, **kwargs)

    def form_valid(self, form) -> http.JsonResponse:
        employee = self.get_employee_queryset()
        found_emp = self._find_employee(form.cleaned_data["user"])
        employee_id: int

        if not found_emp:
            new_emp: business_models.Employee = form.save(commit=False)
            new_emp.construction = employee.construction
            new_emp.save()
            employee_id = new_emp.id
        else:
            with transaction.atomic():
                found_emp.permissions.all().delete()
                found_emp.groups.all().delete()
                found_emp.is_admin = False
                found_emp.is_active = True
                found_emp.save()
                employee_id = found_emp.id

        logging.info(
            f'Employee #{employee.id} added the employee #"{employee_id}" to the team.'
        )

        return responses.Success()

    def form_invalid(self, form: business_forms.SaveGroupForm) -> http.JsonResponse:
        employee = self.get_employee_queryset()

        logging.info(
            f"Employee #{employee.id}. Error on trying to add a  new employee with error. Data: {form.cleaned_data}. Error: {form.errors}"
        )
        return responses.NoContent()

    def _find_employee(self, user: User) -> business_models.Employee | None:
        construction = self.get_employee_queryset().construction

        return business_models.Employee.objects.filter(
            user=user,
            construction=construction,
        ).first()


class EmployeeUpdateView(
    mixins.AccountVerificationMixin, mixins.EmployeePermissionMixin, UpdateView
):
    http_method_names = ["post"]
    model = business_models.Employee
    fields = ["is_admin", "groups", "permissions"]
    pk_url_kwarg = "emp_id"

    def post(self, request: http.HttpRequest, *args, **kwargs):
        employee = self.get_employee_queryset()

        has_permission = employee.has_permission("can_edit_employeesPermissions")
        if not has_permission:
            return responses.Forbidden(
                request=self.request,
                data={
                    "detail": "Não possui a permissão necessária.",
                    "code": "missing_permission",
                },
            )

        return super().post(request, *args, **kwargs)

    def get_queryset(self):
        employee = self.get_employee_queryset()
        return business_models.Employee.objects.filter(
            construction=employee.construction
        )

    def form_valid(self, form: business_forms.SaveGroupForm) -> http.JsonResponse:
        saved_employee = form.save()
        logged_employee = self.get_employee_queryset()

        logging.info(
            f'Employee #{logged_employee.id}. Changed the employee #"{saved_employee.id}".'
        )
        return responses.Success()

    def form_invalid(self, form: business_forms.SaveGroupForm) -> http.JsonResponse:
        return responses.Error(form.errors)
