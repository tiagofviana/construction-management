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

        <AsyncGroupEditor
            v-if="groupEditor.key > 0"
            :key="groupEditor.key"
            :is-update="groupEditor.isUpdate"
            :group="groupEditor.group"
            @saved="fetchGroups()"
        />

        <h1 class="pt-4 pb-6 text-center font-serif text-4xl font-bold">
            Grupos e suas permissões
        </h1>

        <SimpleLoader v-if="isLoadingGroups" class="mx-auto" />
        <button
            v-else-if="permissions.hasPermission(employeeId, 'can_edit_constructionGroups')"
            type="button"
            class="w-full cursor-pointer rounded-md border-2 border-dashed border-black/20 bg-gray-50 p-6 text-gray-400 transition-all duration-200 hover:text-gray-700"
            @click="setGroupEditor(false)"
        >
            <span class="text-center font-medium"> ADICIONAR </span>
        </button>

        <p
            v-if="!isLoadingGroups && groups.length === 0"
            class="rounded-md p-4 text-center text-balance text-black/40"
        >
            Ainda não há grupos nessa construção.
        </p>
        <div v-else class="mt-4 flex flex-col gap-3">
            <div
                v-for="group in groups"
                :key="group.name"
                class="rounded-md border border-black/10 bg-white"
            >
                <button
                    type="button"
                    class="flex w-full cursor-pointer items-center justify-between gap-4 p-6 text-left"
                    @click="toggleGroup(group.name)"
                >
                    <h2 class="font-serif text-xl font-bold">{{ group.name }}</h2>

                    <ChevronUp
                        class="size-5 shrink-0 text-black/40 transition-transform duration-200"
                        :class="{ 'rotate-180': !openGroups.has(group.name) }"
                    />
                </button>

                <div v-if="openGroups.has(group.name)" class="px-6 pb-4">
                    <ul class="space-y-2">
                        <li v-if="group.permissions.length === 0">
                            <p class="text-sm text-black/50">Nenhuma permissão neste grupo.</p>
                        </li>

                        <li
                            v-for="permission in group.permissions"
                            :key="permission.id"
                            class="rounded-md border border-black/10 bg-gray-100 px-3 py-1.5 text-sm"
                        >
                            {{ permission.name }}
                        </li>
                    </ul>

                    <div
                        v-if="permissions.hasPermission(employeeId, 'can_edit_constructionGroups')"
                        class="flex flex-row items-center justify-end gap-4 pt-4"
                    >
                        <button
                            type="button"
                            class="btn btn-red w-24"
                            @click="
                                setModalAlert({
                                    type: 'info',
                                    title: 'Deseja remove?',
                                    message: 'Tem certeza que deseja remove o grupo?',
                                    okLabel: 'Confirmar',
                                    hasCancelButton: true,
                                    cancelLabel: 'Cancel',
                                    okFunction: () => {
                                        removeGroup(group.id)
                                    },
                                })
                            "
                        >
                            Remover
                        </button>

                        <button
                            type="button"
                            class="btn btn-gray w-24"
                            @click="setGroupEditor(true, group)"
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
import type { Group } from '@/components/business/GroupEditor.vue'

const AsyncModalAlert = defineAsyncComponent(() => import('@/components/alerts/ModalAlert.vue'))
const AsyncGroupEditor = defineAsyncComponent(() => import('@/components/business/GroupEditor.vue'))

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
const isLoadingGroups = ref<boolean>(false)
const groups = ref<Group[]>([])
const openGroups = ref<Set<string>>(new Set())
const groupEditor = ref({
    key: 0,
    isUpdate: false,
    group: undefined as undefined | Group,
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

function toggleGroup(name: string) {
    if (openGroups.value.has(name)) {
        openGroups.value.delete(name)
    } else {
        openGroups.value.add(name)
    }

    openGroups.value = new Set(openGroups.value)
}

onBeforeMount(() => {
    permissions.fetchPermissions(employeeId)
    provide('employeeId', employeeId)
    fetchGroups()
})

function setGroupEditor(isUpdate: boolean, group: Group | undefined = undefined) {
    groupEditor.value = {
        key: groupEditor.value.key + 1,
        isUpdate: isUpdate,
        group: group,
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

function fetchGroups() {
    if (isLoadingGroups.value) return

    groups.value = []
    isLoadingGroups.value = true
    axios
        .get(`/api/employee/${employeeId}/groups-list`)
        .then((response) => {
            groups.value = response.data.groups
        })
        .finally(() => {
            isLoadingGroups.value = false
        })
}

function removeGroup(groupId: number) {
    axios.get(`/api/employee/${employeeId}/group/${groupId}/delete`).then(() => {
        fetchGroups()
    })
}
</script>
