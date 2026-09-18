import logging
from django.http import HttpRequest, JsonResponse
from django.core.cache import cache
from django.utils import timezone
from .. import utils


class RateLimitMiddleware:
    RATE_LIMIT = 90  # Number of allowed requests
    RATE_LIMIT_LOG = 70
    TIME_PERIOD = 60  # Time period in seconds

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request: HttpRequest):
        # Code to be executed before the view (and later middleware) are called.
        ip = utils.get_client_ip(request)
        key = f"core:middlearea:rate_limit-{ip}"
        data = cache.get(key, None)

        if data is None:
            data = 0
            cache.set(key, data, timeout=self.TIME_PERIOD)

        if data >= self.RATE_LIMIT_LOG and data < self.RATE_LIMIT:
            logging.warning(
                f'User #{request.user.id} is near to exceed the rate limit. He is trying to access: "{request.get_full_path()}". Post:{request.POST}'
            )

        if data >= self.RATE_LIMIT:
            logging.error(
                f'User #{request.user.id} exceeded the rate limit. He is trying to access: "{request.get_full_path()}". Post:{request.POST}'
            )
            data = {"error": "Rate limit exceeded"}

            return JsonResponse(data=data, status=429)

        cache.incr(key)

        response = self.get_response(request)
        # Code to be executed afterthe view is called.
        return response
