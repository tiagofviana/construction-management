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
        ],
    },
]
