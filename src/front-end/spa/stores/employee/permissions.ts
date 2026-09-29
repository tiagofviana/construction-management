import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export interface Permission {
    name: string
    codename: string
}

export const permissionsStore = defineStore('permissions', () => {
    const permissions = ref<Array<Permission> | null>(null)

    async function fetchPermissions(employeeId: number): Promise<Array<Permission> | null> {
        if (permissions.value !== null) return permissions.value

        const response = await axios.get(`/api/employee/${employeeId}/permissions-list`)
        if (response.status === 204) {
            return null
        }

        permissions.value = response.data.permissions as Array<Permission>
        return permissions.value
    }

    function hasPermission(employeeId: number, codename: string): boolean {
        if (permissions.value === null) return false

        return permissions.value.some((permission) => {
            if (permission.codename === 'is_admin') return true
            if (permission.codename === codename) return true

            return false
        })
    }

    function getAllPermissions() {
        return permissions.value
    }

    function reset() {
        permissions.value = null
    }

    return { fetchPermissions, hasPermission, getAllPermissions, reset }
})
