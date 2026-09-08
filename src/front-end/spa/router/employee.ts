import type { RouteRecordRaw, RouteLocationNormalized } from 'vue-router'
import { Content } from '@/types/content'

export async function updateEmployeeBreadcrumbs(to: RouteLocationNormalized) {
    const { breadcrumbsStore } = await import('@/stores/employee/breadcrumbs')
    const breadcrumbs = breadcrumbsStore()

    const reset = to.meta.breadcrumbReset
    if (reset) {
        breadcrumbs.reset()
    }

    const label = to.meta.breadcrumbLabel as string
    if (label) {
        breadcrumbs.push(label, to.fullPath)
    }
}

export const employeeRoutes: RouteRecordRaw[] = [
    {
        path: '/f',
        meta: { content: Content.Employee },
        children: [
            {
                path: 'construcoes',
                name: 'employee.contructions-list',
                component: () => import('@/views/employee/ConstructionsListView.vue'),
                meta: {
                    breadcrumbReset: true,
                },
            },

            {
                path: ':employeeId/dashboard/',
                name: 'employee.contruction-dashboard',
                component: () => import('@/views/employee/DashboardView.vue'),
                meta: {
                    breadcrumbLabel: 'Painel',
                },
            },

            {
                path: ':employeeId/andar/:floorId/editor',
                name: 'employee.floor-editor',
                component: () => import('@/views/employee/FloorEditorView.vue'),
                meta: {
                    breadcrumbLabel: 'Editor',
                },
            },
            {
                path: ':employeeId/mapa',
                name: 'employee.contruction-map',
                component: () => import('@/views/employee/ContructionMapView.vue'),
                meta: {
                    breadcrumbLabel: 'Mapa',
                },
            },
        ],
    },
]
