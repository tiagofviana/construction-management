import { defineStore } from 'pinia'
import axios from 'axios'
import { setAxiosTokens, getCSRFTokenInput, clearAxiosAuthorization } from '@/plugins/axiosDefault'

const AUTH_TOKEN_NAME = 'authToken'

interface LoginDetail {
    username: string
    password: string
    stayConnected?: boolean
}

const cookieAuth = {
    create(token: string) {
        document.cookie = `${AUTH_TOKEN_NAME}=${token}; Path=/; Secure; SameSite=Lax`
    },

    get(): string {
        const cookies = `; ${document.cookie}`
        const parts = cookies.split(`${AUTH_TOKEN_NAME}=`)

        if (parts.length !== 2) return ''

        const value = parts.pop()!.split(';').shift() || ''

        return value
    },

    delete() {
        document.cookie = `${AUTH_TOKEN_NAME}=; Path=/; Max-Age=0;`
    },
}

export const authStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem(AUTH_TOKEN_NAME) || cookieAuth.get() || '',
    }),

    actions: {
        async login({ username, password, stayConnected = false }: LoginDetail) {
            return axios
                .post('/api/account/login/form', {
                    username: username,
                    password: password,
                    stay_connected: stayConnected,
                })
                .then((response) => {
                    const data = response.data

                    // Update tokens
                    getCSRFTokenInput().value = data.csrf
                    setAxiosTokens(data.authorization, data.csrf)

                    // Save session and in memory
                    this.token = data.authorization
                    cookieAuth.create(this.token)

                    // Save locally
                    if (stayConnected === true) {
                        localStorage.setItem(AUTH_TOKEN_NAME, this.token)
                    }
                })
        },

        async isTokenValid(): Promise<boolean> {
            let isValid = false

            if (this.token === '') {
                return isValid
            }

            await axios
                .get('/api/account/auth/token/validate')
                .then((response) => {
                    if (response.status === 204) {
                        isValid = true
                    }
                })
                .catch((error) => {
                    console.error(error)
                    this.reset()
                    this.$reset()
                })

            return isValid
        },

        reset() {
            this.token = ''
            cookieAuth.delete()
            localStorage.removeItem(AUTH_TOKEN_NAME)
            clearAxiosAuthorization()
        },
    },
})
