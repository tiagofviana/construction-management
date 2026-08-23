import type { RouteRecordRaw } from 'vue-router'
import { MenuContent } from '@/types/components/menu'

export const employeeRoutes: RouteRecordRaw[] = [
    {
        path: '/f',
        meta: { menuContent: MenuContent.Employee },

        children: [
            {
                path: 'construcoes',
                name: 'employee.contructions-list',
                component: () => import('@/views/employee/ConstructionsListView.vue'),
            },

            {
                path: ':employeeId/dashboard/',
                name: 'employee.contruction-dashboard',
                component: () => import('@/views/employee/DashboardView.vue'),
            },

            {
                path: ':employeeId/andar/:floorId/editor',
                name: 'employee.floor-editor',
                component: () => import('@/views/employee/FloorEditorView.vue'),
            },
        ],
    },
]
