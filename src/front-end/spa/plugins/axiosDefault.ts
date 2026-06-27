import axios from 'axios'
import router from '@/router'
import { authStore } from '@/stores/auth'
import { resetAll } from '@/plugins/piniaReset'

export function getCSRFTokenInput(): HTMLInputElement {
    const input = document.querySelector('input[name=csrfmiddlewaretoken]') as HTMLInputElement

    if (input == null) {
        throw new Error('Csrf token not found')
    }

    return input
}

export function setAxiosTokens(authorization: string, csrf: string) {
    if (authorization) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${authorization}`
    }
    axios.defaults.headers.common['X-CSRFToken'] = csrf
}

export function clearAxiosAuthorization() {
    delete axios.defaults.headers.common['Authorization']
}

export default {
    install() {
        const auth = authStore()

        setAxiosTokens(auth.token, getCSRFTokenInput().value)
        axios.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded'

        axios.interceptors.response.use(
            (response) => {
                return response
            },
            (error) => {
                if (error.response.status === 401) {
                    resetAll()
                    router.push({
                        name: 'error.unauthorized',
                    })
                }

                if (error.response.status === 403) {
                    resetAll()
                    router.push({
                        name: 'error.forbidden',
                    })
                }

                if (error.response.status === 404) {
                    router.push({
                        name: 'error.resourceNotFound',
                        query: { q: error.config.url || '' },
                    })
                }

                return Promise.reject(error)
            },
        )
    },
}
