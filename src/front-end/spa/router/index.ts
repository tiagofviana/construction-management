import { createRouter, createWebHistory } from 'vue-router'
import { publicRoutes } from '@/router/public'
import { privateRoutes } from '@/router/private'

const router = createRouter({
    history: createWebHistory(),
    routes: [...publicRoutes, ...privateRoutes],
})

export default router
