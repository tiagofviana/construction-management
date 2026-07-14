from django.http import JsonResponse


class Success(JsonResponse):
    # The request succeeded.
    status_code = 200

    def __init__(self, data: dict = {}, *args, **kwargs):
        super().__init__(data, *args, **kwargs)


class Created(JsonResponse):
    # The request succeeded.
    status_code = 201

    def __init__(self, data: dict = {}, *args, **kwargs):
        super().__init__(data, *args, **kwargs)


class NoContent(JsonResponse):
    # The server processed the request successfully but isn’t sending any content back.
    status_code = 204

    def __init__(self, data={}, *args, **kwargs):
        super().__init__(data, *args, **kwargs)


class Error(JsonResponse):
    # The server can’t process your request. Client-side error, wrong parameters.
    status_code = 400

    def __init__(self, errors: dict, **kwargs):
        data = {"errors": errors}
        super().__init__(data, **kwargs)


class Unauthorized(JsonResponse):
    # The request was not processed because the user does not have valid authentication credentials.
    status_code = 401

    def __init__(self, data: dict = {}, *args, **kwargs):
        super().__init__(data, *args, **kwargs)


class Forbidden(JsonResponse):
    # The server understood your request but denied access. Insufficient permissions.
    status_code = 403

    def __init__(self, data: dict, *args, **kwargs):
        super().__init__(data, *args, **kwargs)


class NotFound(JsonResponse):
    # The server can’t find the requested resource.
    status_code = 404

    def __init__(self, *args, **kwargs):

        data = {
            "detail": "Recurso não encontrado.",
            "code": "resource_not_found",
        }

        super().__init__(data, *args, **kwargs)


class Conflict(JsonResponse):
    # The server can’t process the request due to a conflict with the resource.
    status_code = 409

    def __init__(self, *args, **kwargs):
        if not data:
            data = {
                "detail": "Conflito.",
                "code": "conflict",
            }

        super().__init__(data=data, *args, **kwargs)
