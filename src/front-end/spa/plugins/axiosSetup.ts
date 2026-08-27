import axios from 'axios'
import router from '@/router'
import { resetAll } from '@/plugins/piniaReset'

function getCookie(name: string): string {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
    return match ? decodeURIComponent(match[2]) : ''
}

export default {
    install() {
        axios.defaults.withCredentials = true
        axios.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded'

        axios.interceptors.request.use((config) => {
            const csrfToken = getCookie('csrftoken')
            if (csrfToken) {
                config.headers['X-CSRFToken'] = csrfToken
            }
            return config
        })

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
