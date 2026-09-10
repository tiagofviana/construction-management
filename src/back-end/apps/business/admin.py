from django.contrib import admin
from . import models


@admin.register(models.Construction)
class ConstructionAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Employee)
class EmployeeAdmin(admin.ModelAdmin):
    pass
