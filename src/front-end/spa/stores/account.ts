import { defineStore } from 'pinia'
import axios from 'axios'

export interface AccountInfo {
    firstName: string
    lastName: string
    email: string
    isStaff: boolean
    lastLogin: Date
}

export const accountStore = defineStore('account', () => {
    let info: AccountInfo | null = null

    async function getInfo(): Promise<AccountInfo | null> {
        if (info !== null) return info

        const response = await axios.get('/api/account/info/get')

        if (response.status === 204) {
            return null
        }

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

        return info
    }

    function reset() {
        info = null
    }

    return { getInfo, reset }
})
