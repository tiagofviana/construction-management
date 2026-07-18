import { createRouter, createWebHistory } from 'vue-router'
import { publicRoutes } from '@/router/public'
import { errorRoutes } from '@/router/error'
import { employeeRoutes } from '@/router/employee'

const router = createRouter({
    history: createWebHistory(),
    routes: [...publicRoutes, ...employeeRoutes, ...errorRoutes],
})

export default router
