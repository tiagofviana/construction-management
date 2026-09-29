<template>
    <section class="mx-auto my-6 w-11/12 max-w-3xl">
        <AsyncModalAlert
            v-if="modalAlert.key > 0"
            :key="modalAlert.key"
            :type="modalAlert.type"
            :title="modalAlert.title"
            :message="modalAlert.message"
            :ok-label="modalAlert.okLabel"
            :has-cancel-button="modalAlert.hasCancelButton"
            :cancel-label="modalAlert.cancelLabel"
            @ok="modalAlert.okFunction"
        />
        <AsyncEmployeeAdd
            v-if="employeeAddKey > 0"
            :key="employeeAddKey"
            @add-new-employee="fetchTeam()"
        />

        <AsyncEditEmployee
            v-if="employeeEditor.key > 0"
            :key="employeeEditor.key"
            :employee="employeeEditor.employee!"
            @saved="fetchTeam()"
        />

        <h1 class="pt-4 pb-6 text-center font-serif text-4xl font-bold">Equipe e permissões</h1>

        <SimpleLoader v-if="isLoadingTeam" class="mx-auto" />
        <button
            v-else-if="permissions.hasPermission(employeeId, 'can_add_employees')"
            type="button"
            class="w-full cursor-pointer rounded-md border-2 border-dashed border-black/20 bg-gray-50 p-6 text-gray-400 transition-all duration-200 hover:text-gray-700"
            @click="employeeAddKey += 1"
        >
            <span class="text-center font-medium"> ADICIONAR </span>
        </button>

        <p
            v-if="!isLoadingTeam && employees.length === 0"
            class="rounded-md p-4 text-center text-balance text-black/40"
        >
            Ainda não há funcionários nessa construção.
        </p>
        <div v-else class="mt-4 flex flex-col gap-3">
            <div
                v-for="employee in employees"
                :key="employee.id"
                class="rounded-md border border-black/10 bg-white"
            >
                <button
                    type="button"
                    class="flex w-full items-center justify-between gap-4 p-6 text-left"
                    :class="{
                        'cursor-pointer': permissions.hasPermission(
                            employeeId,
                            'can_view_employeesPermissions',
                        ),
                    }"
                    @click="toggleEmployee(employee.id)"
                >
                    <div class="flex-1">
                        <h2 class="line-clamp-1 font-serif text-xl font-bold">
                            {{ employee.fullname }}
                        </h2>
                        <p class="line-clamp-1 text-sm text-black/50">{{ employee.email }}</p>
                    </div>

                    <div v-if="employee.isAdmin" class="shrink-0">
                        <p
                            class="rounded border border-black/20 bg-orange-200 px-1 text-orange-900"
                        >
                            admin
                        </p>
                    </div>

                    <ChevronUp
                        v-if="
                            permissions.hasPermission(employeeId, 'can_view_employeesPermissions')
                        "
                        class="h-5 w-5 shrink-0 text-black/40 transition-transform duration-200"
                        :class="{ 'rotate-180': !openEmployees.has(employee.id) }"
                    />
                </button>

                <div
                    v-if="
                        openEmployees.has(employee.id) &&
                        permissions.hasPermission(employeeId, 'can_view_employeesPermissions')
                    "
                    class="px-6 pb-4"
                >
                    <div class="flex flex-col gap-6 sm:flex-row">
                        <div class="flex-1">
                            <h3 class="mb-2 text-sm font-bold text-black/60">Grupos</h3>
                            <ul class="space-y-2">
                                <li v-if="employee.groups.length === 0">
                                    <p class="text-sm text-black/50">
                                        Não pertence a nenhum grupo.
                                    </p>
                                </li>

                                <li
                                    v-for="group in employee.groups"
                                    :key="group.id"
                                    class="rounded-md border border-black/10 bg-gray-100 px-3 py-1.5 text-sm"
                                >
                                    {{ group.name }}
                                </li>
                            </ul>
                        </div>

                        <div class="flex-1">
                            <h3 class="mb-2 text-sm font-bold text-black/60">
                                Permissões individuais
                            </h3>
                            <ul class="space-y-2">
                                <li v-if="employee.permissions.length === 0">
                                    <p class="text-sm text-black/50">
                                        Nenhuma permissão individual.
                                    </p>
                                </li>

                                <li
                                    v-for="permission in employee.permissions"
                                    :key="permission.id"
                                    class="rounded-md border border-black/10 bg-gray-100 px-3 py-1.5 text-sm"
                                >
                                    {{ permission.name }}
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div
                        v-if="
                            employee.id !== employeeId &&
                            permissions.hasPermission(employeeId, 'can_edit_employeesPermissions')
                        "
                        class="flex flex-row items-center justify-end gap-4 pt-6"
                    >
                        <button
                            type="button"
                            class="btn btn-red w-28"
                            @click="
                                setModalAlert({
                                    type: 'info',
                                    title: `Deseja desativar funcionário ?`,
                                    message: `Clique em confirmar para desativara o funcionário ${employee.fullname}`,
                                    okLabel: 'Confirmar',
                                    hasCancelButton: true,
                                    cancelLabel: 'Cancelar',
                                    okFunction: () => {
                                        desactiveEmployee(employee)
                                    },
                                })
                            "
                        >
                            Desativar
                        </button>

                        <button
                            type="button"
                            class="btn btn-gray w-24"
                            @click="setEmployeeEditor(employee)"
                        >
                            Editar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, defineAsyncComponent, provide } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { ChevronUp } from '@lucide/vue'
import SimpleLoader from '@/components/loading/SimpleLoader.vue'
import { type ModalType } from '@/components/alerts/ModalAlert.vue'
import { permissionsStore } from '@/stores/employee/permissions'
import type { Employee } from '@/components/business/EmployeeEditor.vue'

const AsyncModalAlert = defineAsyncComponent(() => import('@/components/alerts/ModalAlert.vue'))
const AsyncEmployeeAdd = defineAsyncComponent(() => import('@/components/business/EmployeeAdd.vue'))
const AsyncEditEmployee = defineAsyncComponent(
    () => import('@/components/business/EmployeeEditor.vue'),
)

interface ModalSettings {
    type: ModalType
    title: string
    message: string
    okLabel: string
    hasCancelButton: boolean
    cancelLabel: string
    okFunction: () => void
}

const route = useRoute()
const permissions = permissionsStore()
const employeeId = Number(route.params.employeeId)
const isLoadingTeam = ref<boolean>(false)
const employees = ref<Employee[]>([])
const openEmployees = ref<Set<number>>(new Set())
const employeeAddKey = ref(0)
const employeeEditor = ref({
    key: 0,
    employee: undefined as undefined | Employee,
})
const modalAlert = ref({
    type: 'success' as ModalType,
    title: '',
    message: '',
    key: 0,
    okLabel: '',
    hasCancelButton: false,
    cancelLabel: '',
    okFunction: () => {},
})

function toggleEmployee(id: number) {
    if (openEmployees.value.has(id)) {
        openEmployees.value.delete(id)
    } else {
        openEmployees.value.add(id)
    }

    openEmployees.value = new Set(openEmployees.value)
}

onBeforeMount(() => {
    permissions.fetchPermissions(employeeId)
    provide('employeeId', employeeId)
    fetchTeam()
})

function setEmployeeEditor(employee: Employee) {
    employeeEditor.value = {
        key: employeeEditor.value.key + 1,
        employee: employee,
    }
}

function setModalAlert(settings: ModalSettings) {
    modalAlert.value = {
        key: modalAlert.value.key + 1,
        type: settings.type,
        title: settings.title,
        message: settings.message,
        okLabel: settings.okLabel,
        hasCancelButton: settings.hasCancelButton,
        cancelLabel: settings.cancelLabel,
        okFunction: settings.okFunction,
    }
}

function fetchTeam() {
    if (isLoadingTeam.value) return

    employees.value = []
    isLoadingTeam.value = true
    axios
        .get(`/api/employee/${employeeId}/team-list`)
        .then((response) => {
            employees.value = response.data.employees
        })
        .finally(() => {
            isLoadingTeam.value = false
        })
}

function desactiveEmployee(employee: Employee) {
    axios.get(`/api/employee/${employeeId}/deactivate-employee/${employee.id}/`).then(() => {
        fetchTeam()
    })
}
</script>
