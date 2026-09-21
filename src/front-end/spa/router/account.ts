import type { RouteRecordRaw } from 'vue-router'

export const accountRoutes: RouteRecordRaw[] = [
    {
        path: '/conta',
        children: [
            {
                path: 'verificacao-de-emil',
                name: 'account.email-verification',
                component: () => import('@/views/account/EmailVerificationView.vue'),
            },
        ],
    },
]
