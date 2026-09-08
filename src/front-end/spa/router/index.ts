import { createRouter, createWebHistory } from 'vue-router'
import { publicRoutes } from '@/router/public'
import { errorRoutes } from '@/router/error'
import { employeeRoutes } from '@/router/employee'
import { Content } from '@/types/content'

const router = createRouter({
    history: createWebHistory(),
    routes: [...publicRoutes, ...employeeRoutes, ...errorRoutes],
})

router.beforeEach(async (to) => {
    if (process.env.NODE_ENV === 'production') {
        console.clear()
    }

    if (to.meta.content === Content.Employee) {
        const { updateEmployeeBreadcrumbs } = await import('@/router/employee')
        updateEmployeeBreadcrumbs(to)
    }
})

export default router
