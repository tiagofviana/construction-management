import type { RouteRecordRaw } from 'vue-router'
import { MenuContent } from '@/types/components/menu'

export const publicRoutes: RouteRecordRaw[] = [
    // {
    //     path: '/confirmar',
    //     name: 'public.confirmation',
    //     component: () => import('@/views/public/ConfirmationView.vue'),
    //     props: (route) => ({
    //         message: route.query.message,
    //         redirect: route.query.redirect,
    //     }),
    // },
    // {
    //     path: '/redirecionamento/:animate?',
    //     name: 'public.redirect',
    //     component: () => import('@/views/public/RedirectView.vue'),
    // },
    {
        path: '',
        meta: { menuContent: MenuContent.Public },
        children: [
            {
                path: '/',
                name: 'public.home',
                component: () => import('@/views/public/HomeView.vue'),
            },
            // {
            //     path: '/login',
            //     name: 'public.login',
            //     beforeEnter: () => {
            //         const auth = authStore()
            //         if (auth.token !== '') {
            //             router.replace({ name: 'public.redirect' })
            //             return false
            //         }
            //         return true
            //     },
            //     component: () => import('@/views/public/LoginView.vue'),
            // },
            // {
            //     path: '/esqueceu-senha',
            //     name: 'public.forgot-password',
            //     component: () => import('@/views/public/ForgotPasswordView.vue'),
            // },
            // {
            //     path: '/sair',
            //     name: 'public.logout',
            //     component: () => import('@/views/public/LogoutView.vue'),
            // },
            // {
            //     path: '/conta/criar',
            //     name: 'public.account-create',
            //     component: () => import('@/views/public/AccountCreateView.vue'),
            // },
        ],
    },
]
