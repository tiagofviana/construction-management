<template>
    <Teleport to="body">
        <section
            ref="section"
            v-if="!isHidden"
            class="fixed top-0 left-0 z-100 h-full max-h-dvh w-full overflow-auto bg-black/40 py-8 shadow-2xl shadow-black/10 backdrop-blur-sm select-none"
        >
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

            <form
                ref="form"
                class="mx-auto w-11/12 max-w-6xl shrink-0 overflow-hidden rounded-lg border border-black/20 bg-slate-100"
                @submit.prevent="handleSubmit()"
            >
                <button
                    type="button"
                    @click="animateOut()"
                    class="ml-auto block cursor-pointer border-black/10 stroke-gray-400 p-1 hover:stroke-black"
                >
                    <X :size="36" :strokeWidth="2" aria-label="Fechar" class="stroke-inherit" />
                </button>

                <div class="px-6 pb-6">
                    <h2 class="text-center font-serif text-4xl font-bold">Editar funcionário</h2>

                    <p class="mt-2 text-center text-sm text-black/50">
                        {{ props.employee.fullname }} · {{ props.employee.email }}
                    </p>

                    <AsyncInlineAlert
                        v-if="inlineAlert.message"
                        :message="inlineAlert.message"
                        :type="inlineAlert.type"
                        :key="inlineAlert.key"
                    />

                    <!-- Admin -->
                    <div class="field mt-6" :class="{ 'invalid-field': formErrors.isAdmin }">
                        <label>É um administrador:</label>

                        <YesNoField
                            :initial="props.employee.isAdmin"
                            @change="
                                (v) => {
                                    form.isAdmin = v
                                    delete formErrors.isAdmin
                                }
                            "
                        />

                        <p class="max-w-xs px-1 text-xs text-pretty text-gray-500">
                            A selecionação da opção com "SIM" faz com que tenha TODAS as permissões.
                        </p>

                        <FieldErrors v-if="formErrors.isAdmin" :messages="formErrors.isAdmin" />
                    </div>

                    <!-- Permissions -->
                    <div class="field mt-6" :class="{ 'invalid-field': formErrors.permissions }">
                        <label>Permissões individuais:</label>

                        <SelectMultiple
                            :initial="initialPermissions"
                            :options="constructionPermissions"
                            @change="
                                (v) => {
                                    form.permissions = v
                                    delete formErrors.permissions
                                }
                            "
                        />

                        <FieldErrors
                            v-if="formErrors.permissions"
                            :messages="formErrors.permissions"
                        />
                    </div>

                    <!-- Groups -->
                    <div class="field" :class="{ 'invalid-field': formErrors.groups }">
                        <label>Grupos:</label>

                        <SelectMultiple
                            :initial="initialGroups"
                            :options="constructionGroups"
                            @change="
                                (v) => {
                                    form.groups = v
                                    delete formErrors.groups
                                }
                            "
                        />

                        <FieldErrors v-if="formErrors.groups" :messages="formErrors.groups" />
                    </div>

                    <button class="btn btn-blue mx-auto mt-6" type="submit">
                        <TextLoading
                            text="Salvar"
                            :isLoading="isFormLoading"
                            class="stroke-white"
                        />
                    </button>
                </div>
            </form>
        </section>
    </Teleport>
</template>

<script setup lang="ts">
import {
    ref,
    defineAsyncComponent,
    useTemplateRef,
    onMounted,
    onBeforeMount,
    inject,
    PropType,
    computed,
} from 'vue'
import axios from 'axios'
import { X } from '@lucide/vue'
import gsap from 'gsap'
import SelectMultiple, { type KeyValue } from '@/components/form/SelectMultiple.vue'
import type { ModalType } from '@/components/alerts/ModalAlert.vue'
import type { InlineType } from '@/components/alerts/InlineAlert.vue'
import YesNoField from '@/components/form/YesNoField.vue'
import TextLoading from '@/components/loading/TextLoading.vue'
import FieldErrors from '@/components/form/FieldErrors.vue'

const AsyncInlineAlert = defineAsyncComponent(() => import('@/components/alerts/InlineAlert.vue'))
const AsyncModalAlert = defineAsyncComponent(() => import('@/components/alerts/ModalAlert.vue'))

interface Permission {
    id: number
    name: string
}

interface EmployeeGroup {
    id: number
    name: string
}

export interface Employee {
    id: number
    fullname: string
    email: string
    isAdmin: boolean
    permissions: Permission[]
    groups: EmployeeGroup[]
}

interface ModalSettings {
    type: ModalType
    title: string
    message: string
    okLabel: string
    hasCancelButton: boolean
    cancelLabel: string
    okFunction: () => void
}

const emit = defineEmits<{
    saved: []
}>()

const props = defineProps({
    employee: {
        type: Object as PropType<Employee>,
        required: true,
    },
})

const constructionPermissions = ref<Array<KeyValue>>([])
const constructionGroups = ref<Array<KeyValue>>([])
const initialPermissions = computed(() => {
    return props.employee.permissions.map((item) => {
        return {
            key: item.id,
            value: item.name,
        }
    })
})
const initialGroups = computed(() => {
    return props.employee.groups.map((item) => {
        return {
            key: item.id,
            value: item.name,
        }
    })
})
const employeeId = inject('employeeId')
const section = useTemplateRef('section')
const formRef = useTemplateRef('form')
const isHidden = ref(false)
const isFormLoading = ref(false)
const inlineAlert = ref<{ message: string; key: number; type: InlineType }>({
    message: '',
    key: 0,
    type: 'error',
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
const form = ref({
    isAdmin: props.employee.isAdmin,
    permissions: initialPermissions.value as KeyValue[],
    groups: initialGroups.value as KeyValue[],
})
const formErrors = ref<{
    permissions?: string[]
    groups?: string[]
    isAdmin?: string[]
}>({})

onBeforeMount(async () => {
    axios.get(`/api/employee/${employeeId}/construction/all-permissions-list`).then((response) => {
        const permissionsList = response.data.permissions as Permission[]
        constructionPermissions.value = permissionsList.map((item) => {
            return {
                key: item.id,
                value: item.name,
            }
        })
    })

    axios.get(`/api/employee/${employeeId}/construction/all-groups-list`).then((response) => {
        const groupsList = response.data.groups as EmployeeGroup[]
        constructionGroups.value = groupsList.map((item) => {
            return {
                key: item.id,
                value: item.name,
            }
        })
    })
})

onMounted(() => {
    animateIn()
})

function animateIn() {
    const tl = gsap.timeline({
        ease: 'power1.in',
    })

    tl.from(section.value, {
        duration: 0.5,
        opacity: 0,
    })

    tl.from(
        formRef.value,
        {
            duration: 0.7,
            opacity: 0,
            y: '20%',
        },
        '<',
    )
}

function animateOut() {
    const tl = gsap.timeline({
        ease: 'power1.in',
        onComplete: () => {
            isHidden.value = true
        },
    })

    tl.to(section.value, {
        duration: 0.7,
        opacity: 0,
    })

    tl.to(
        formRef.value,
        {
            duration: 0.5,
            opacity: 0,
            y: '20%',
        },
        '<',
    )
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

function setInlineAlert(msg: string, type: InlineType) {
    inlineAlert.value.message = msg
    inlineAlert.value.key++
    inlineAlert.value.type = type
}

function handleSubmit() {
    if (isFormLoading.value) return
    isFormLoading.value = true

    const formData = new FormData()

    formData.append('is_admin', String(form.value.isAdmin))

    form.value.permissions.forEach((item) => {
        formData.append('permissions', String(item.key))
    })

    form.value.groups.forEach((item) => {
        formData.append('groups', String(item.key))
    })

    axios
        .post(`/api/employee/${employeeId}/employee/${props.employee.id}/update/form`, formData)
        .then(() => {
            setModalAlert({
                type: 'success',
                title: 'Sucesso',
                message: 'O funcionário foi atualizado com sucesso.',
                okLabel: 'Confirmar',
                hasCancelButton: false,
                cancelLabel: '',
                okFunction: () => {
                    emit('saved')
                    isHidden.value = true
                },
            })
        })
        .catch((error) => {
            isFormLoading.value = false

            if (error.status === 400) {
                const responseErros = error.response.data.errors

                if (responseErros.__all__) {
                    setInlineAlert(responseErros.__all__[0], 'error')
                }

                formErrors.value = {
                    permissions: responseErros.permissions || undefined,
                    groups: responseErros.groups || undefined,
                }

                return
            }

            console.error(error)
            setModalAlert({
                type: 'error',
                title: 'Erro inesperado',
                message:
                    'O servidor não conseguiu processar a solicitação, por favor, contacte a nossa equipe.',
                okLabel: 'Confirmar',
                hasCancelButton: false,
                cancelLabel: '',
                okFunction: () => {},
            })
        })
}
</script>
