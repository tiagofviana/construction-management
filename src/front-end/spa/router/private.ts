import type { RouteRecordRaw } from 'vue-router'
import { MenuContent } from '@/types/components/menu'

export const privateRoutes: RouteRecordRaw[] = [
    {
        path: '',
        meta: { menuContent: MenuContent.Private },
        children: [
            {
                path: '/p',
                name: 'private.home',
                component: () => import('@/views/private/KonvaView.vue'),
            },
            {
                path: '/p2',
                component: () => import('@/views/private/CopyView.vue'),
            },
            {
                path: '/teste',
                component: () => import('@/views/private/TestView1.vue'),
            },
            {
                path: '/teste2',
                component: () => import('@/views/private/TestView2.vue'),
            },
        ],
    },
]
