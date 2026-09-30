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
            <div
                ref="container"
                class="mx-auto w-11/12 max-w-xl shrink-0 overflow-hidden rounded-lg border border-black/20 bg-slate-100"
            >
                <button
                    type="button"
                    @click="animateOut()"
                    class="ml-auto block cursor-pointer border-black/10 stroke-gray-400 p-1 hover:stroke-black"
                >
                    <X :size="36" :strokeWidth="2" aria-label="Fechar" class="stroke-inherit" />
                </button>

                <div class="px-6 pb-6">
                    <h2 class="text-center font-serif text-4xl font-bold">Adicionar funcionário</h2>

                    <!-- Search -->
                    <div
                        class="full mx-auto mt-6 flex w-11/12 max-w-lg flex-row overflow-hidden rounded-full border border-black/20"
                    >
                        <input
                            ref="input-search"
                            type="text"
                            v-model="search"
                            required
                            placeholder="pesquisar..."
                            @input="makeSearch()"
                            class="flex-1 bg-white px-3"
                        />

                        <button
                            type="button"
                            class="btn btn-blue shrink-0 rounded-none px-4 py-1 ring-0 outline-none"
                            @click="makeSearch()"
                            :disabled="search.length < 3"
                        >
                            <Search :size="24" />
                        </button>
                    </div>

                    <ul
                        style="height: 24rem"
                        class="mx-auto mt-8 mb-2 max-w-lg overflow-auto border border-black/20 bg-gray-200 inset-shadow-sm inset-shadow-black/10"
                    >
                        <li v-if="searchResult.length === 0">
                            <p class="mx-auto mt-8 max-w-xs text-center text-pretty text-gray-500">
                                <template v-if="search.length < 3">
                                    Pesquise o email ou nome para procurar um usuário.
                                </template>

                                <template v-else>
                                    Não foi encontrado usuário que possui o email ou nome que comece
                                    com "{{ search }}".
                                </template>
                            </p>
                        </li>

                        <li
                            v-for="(item, index) in searchResult"
                            :key="index"
                            class="inset-shadow flex flex-row border-b border-black/20 bg-white p-4 inset-shadow-black/20"
                        >
                            <div class="mr-4 flex-1">
                                <p
                                    class="clamp-1 text-gray-800"
                                    v-html="highlightSearch(item.fullname)"
                                ></p>
                                <p
                                    class="clamp-1 text-sm text-gray-600"
                                    v-html="highlightSearch(item.email)"
                                ></p>
                            </div>

                            <button
                                type="button"
                                class="btn btn-blue shrink-0"
                                @click="
                                    setModalAlert({
                                        type: 'info',
                                        title: `Deseja adicionar o funcionário?`,
                                        message: `Clique em confirmar para adicionar o funcionário ${item.fullname}`,
                                        okLabel: 'Confirmar',
                                        hasCancelButton: true,
                                        cancelLabel: 'Cancelar',
                                        okFunction: () => {
                                            addEmployee(item)
                                        },
                                    })
                                "
                            >
                                Adicionar
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, useTemplateRef, onMounted, inject } from 'vue'
import axios from 'axios'
import { X, Search } from '@lucide/vue'
import gsap from 'gsap'
import type { ModalType } from '@/components/alerts/ModalAlert.vue'

const AsyncModalAlert = defineAsyncComponent(() => import('@/components/alerts/ModalAlert.vue'))

interface User {
    id: number
    fullname: string
    email: string
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
    addNewEmployee: []
}>()

const employeeId = inject('employeeId')
const section = useTemplateRef('section')
const formRef = useTemplateRef('container')
const inputSearch = useTemplateRef('input-search')
const isHidden = ref(false)
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
const search = ref('')
const searchResult = ref<User[]>([])

onMounted(() => {
    animateIn()
    inputSearch.value?.focus()
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

function makeSearch() {
    if (search.value.length < 3) {
        searchResult.value = []
        return
    }

    const formData = new FormData()
    formData.append('search', search.value)

    axios
        .post(`/api/employee/${employeeId}/search/new-employee`, formData)
        .then((response) => {
            const data = response.data
            searchResult.value = data.result
        })
        .catch((error) => {
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

function highlightSearch(text: string) {
    if (!search.value || search.value.length < 1) {
        return text
    }

    const escapedSearch = search.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    return text.replace(
        new RegExp(`(${escapedSearch})`, 'gi'),
        '<strong class="font-bold text-black">$1</strong>',
    )
}

function addEmployee(user: User) {
    const formData = new FormData()
    formData.append('user', String(user.id))

    axios.post(`/api/employee/${employeeId}/employee/create/form`, formData).then(() => {
        emit('addNewEmployee')
    })

    isHidden.value = true
}
</script>
