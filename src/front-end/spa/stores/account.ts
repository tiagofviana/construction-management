import { defineStore } from 'pinia'
import axios from 'axios'

export interface AccountInfo {
    firstName: string
    lastName: string
    email: string
    isStaff: boolean
    isEmailVerified: boolean
    lastLogin: Date
}

export const accountStore = defineStore('account', () => {
    let info: AccountInfo | null = null

    async function getInfo(): Promise<AccountInfo | null> {
        if (info === null) {
            await axios.get('/api/account/info/get').then((response) => {
                const lastLogin = new Date(response.data.lastLogin).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })

                info = {
                    ...response.data,
                    lastLogin: lastLogin,
                }
            })
        }
        return info
    }

    async function isAccountVerified() {
        const info = await getInfo()

        if (info === null) {
            return false
        }

        if (info.isEmailVerified === false) {
            return false
        }

        return true
    }

    function reset() {
        info = null
    }

    return { getInfo, isAccountVerified, reset }
})
