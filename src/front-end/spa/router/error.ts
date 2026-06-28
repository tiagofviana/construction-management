import type { RouteRecordRaw } from 'vue-router'

export const errorRoutes: RouteRecordRaw[] = [
    {
        path: '/:pathMatch(.*)*',
        name: 'error.NotFound',
        component: () => import('@/views/error/NotFoundView.vue'),
    },
]
