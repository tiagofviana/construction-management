import { createRouter, createWebHistory } from 'vue-router'
import { publicRoutes } from '@/router/public'
import { privateRoutes } from '@/router/private'
import { errorRoutes } from '@/router/error'

const router = createRouter({
    history: createWebHistory(),
    routes: [...publicRoutes, ...privateRoutes, ...errorRoutes],
})

export default router
