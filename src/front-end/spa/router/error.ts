import type { RouteRecordRaw } from 'vue-router'

export const errorRoutes: RouteRecordRaw[] = [
    {
        path: '/401',
        name: 'error.unauthorized',
        component: () => import('@/views/error/UnauthorizedView.vue'),
    },
    {
        path: '/403',
        name: 'error.forbidden',
        component: () => import('@/views/error/ForbiddenView.vue'),
    },
    {
        path: '/recurso-nao-encontrado',
        name: 'error.resourceNotFound',
        component: () => import('@/views/error/ResourceNotFoundView.vue'),
        props: (route) => ({ query: route.query.q }),
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'error.NotFound',
        component: () => import('@/views/error/NotFoundView.vue'),
    },
]
