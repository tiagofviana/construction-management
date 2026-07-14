import { useRouter, type RouteRecordRaw } from 'vue-router'
import { MenuContent } from '@/types/components/menu'
import { accountStore } from '@/stores/account'

export const publicRoutes: RouteRecordRaw[] = [
    {
        path: '/redirecionamento/:animate?',
        name: 'public.redirect',
        component: () => import('@/views/public/RedirectView.vue'),
    },
    {
        path: '/',
        name: 'public.home',
        redirect: { name: 'public.login' },
    },
    {
        path: '/sair',
        name: 'public.logout',
        component: () => import('@/views/public/LogoutView.vue'),
    },

    {
        path: '',
        meta: { menuContent: MenuContent.Public },
        children: [
            {
                path: '/login',
                name: 'public.login',
                component: () => import('@/views/public/LoginView.vue'),
                beforeEnter: async () => {
                    const account = accountStore()
                    const info = await account.getInfo()

                    if (info !== null) {
                        useRouter().replace({ name: 'public.redirect' })
                        return false
                    }

                    return true
                },
            },
            // {
            //     path: '/esqueceu-senha',
            //     name: 'public.forgot-password',
            //     component: () => import('@/views/public/ForgotPasswordView.vue'),
            // },
            // {
            //     path: '/conta/criar',
            //     name: 'public.account-create',
            //     component: () => import('@/views/public/AccountCreateView.vue'),
            // },
        ],
    },
]
