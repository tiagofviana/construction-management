<template>
    <Teleport to="body">
        <section
            ref="section"
            v-if="!isHidden"
            class="fixed top-0 left-0 z-100 flex h-full max-h-dvh w-full items-center justify-center overflow-auto bg-black/40 py-8 shadow-2xl shadow-black/10 backdrop-blur-sm select-none"
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
                    <h2 class="text-center font-serif text-4xl font-bold">
                        <template v-if="props.isUpdate">Editar grupo</template>
                        <template v-else>Criar novo grupo</template>
                    </h2>

                    <AsyncInlineAlert
                        v-if="inlineAlert.message"
                        :message="inlineAlert.message"
                        :type="inlineAlert.type"
                        :key="inlineAlert.key"
                    />

                    <!-- Name -->
                    <div class="field max-w-sm" :class="{ 'invalid-field': formErrors.name }">
                        <label for="name">Nome:</label>

                        <input
                            id="name"
                            type="text"
                            placeholder=""
                            autocomplete="nome"
                            v-model="form.name"
                            @input="delete formErrors.name"
                            required
                        />

                        <FieldErrors v-if="formErrors.name" :messages="formErrors.name" />
                    </div>

                    <!-- Permissions -->
                    <div class="field" :class="{ 'invalid-field': formErrors.permissions }">
                        <label>Permissões do grupo:</label>

                        <SelectMultiple
                            :initial="groupPermissions"
                            :options="constructionPermissions"
                            @change="
                                (v) => {
                                    form.permissions = v
                                }
                            "
                        />

                        <FieldErrors
                            v-if="formErrors.permissions"
                            :messages="formErrors.permissions"
                        />
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
import SelectMultiple, { type KeyValue } from '../form/SelectMultiple.vue'
import type { ModalType } from '@/components/alerts/ModalAlert.vue'
import type { InlineType } from '@/components/alerts/InlineAlert.vue'
import TextLoading from '@/components/loading/TextLoading.vue'
import FieldErrors from '@/components/form/FieldErrors.vue'

const AsyncInlineAlert = defineAsyncComponent(() => import('@/components/alerts/InlineAlert.vue'))
const AsyncModalAlert = defineAsyncComponent(() => import('@/components/alerts/ModalAlert.vue'))

interface Permission {
    id: number
    name: string
}

export interface Group {
    id: number
    name: string
    permissions: Permission[]
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
    group: {
        type: Object as PropType<Group>,
        required: false,
    },
    isUpdate: {
        type: Boolean,
        required: true,
    },
})

const constructionPermissions = ref<Array<KeyValue>>([])
const groupPermissions = computed(() => {
    if (!props.group) return []

    return props.group.permissions.map((item) => {
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
    name: props.group?.name || '',
    permissions: [] as KeyValue[],
})
const formErrors = ref<{
    name?: string[]
    permissions?: string[]
}>({})

onBeforeMount(async () => {
    axios.get(`/api/employee/${employeeId}/construction/all-permissions-list`).then((response) => {
        const permissions = response.data.permissions as Permission[]
        constructionPermissions.value = permissions.map((item) => {
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

    formData.append('name', form.value.name)

    form.value.permissions.forEach((item) => {
        formData.append('permissions', String(item.key))
    })

    let url
    if (props.isUpdate) {
        url = `/api/employee/${employeeId}/group/${props.group?.id}/update/form`
    } else {
        url = `/api/employee/${employeeId}/group/create/form`
    }

    axios
        .post(url, formData)
        .then(() => {
            setModalAlert({
                type: 'success',
                title: 'Sucesso',
                message: 'O grupo foi criado com sucesso.',
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
                    name: responseErros.name || undefined,
                    permissions: responseErros.permissions || undefined,
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
