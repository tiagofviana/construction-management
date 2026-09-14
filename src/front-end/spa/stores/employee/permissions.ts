import { defineStore } from 'pinia'
import axios from 'axios'

export interface Permission {
    name: string
    codename: string
}

export const permissionsStore = defineStore('permissions', () => {
    let permissions: Array<Permission> | null = null

    async function fetchPermissions(employeeId: number): Promise<Array<Permission> | null> {
        if (permissions !== null) return permissions

        const response = await axios.get(`/api/employee/${employeeId}/permissions-list`)
        if (response.status === 204) {
            return null
        }

        permissions = response.data.permissions as Array<Permission>
        return permissions
    }

    function hasPermission(employeeId: number, codename: string): boolean {
        if (permissions === null) return false

        return permissions.some((permission) => {
            if (permission.codename === 'is_admin') return true
            if (permission.codename === codename) return true

            return false
        })
    }

    function reset() {
        permissions = null
    }

    return { fetchPermissions, hasPermission, reset }
})
