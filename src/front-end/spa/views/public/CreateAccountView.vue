<template>
    <section class="flex min-h-dvh flex-col items-center justify-center py-6">
        <AsyncModalAlert
            v-if="modalAlert.message"
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
            @submit.prevent="handleSubmit()"
            class="w-11/12 max-w-lg rounded-md border border-black/10 bg-white p-6"
            novalidate
        >
            <h1 class="py-4 text-center font-serif text-4xl font-bold">Criar conta</h1>

            <InlineAlert
                v-if="alertInline.message"
                :message="alertInline.message"
                :type="alertInline.type"
                :key="alertInline.key"
            />

            <div class="flex flex-row gap-2">
                <!-- First name -->
                <div
                    class="field w-5/12 shrink-0"
                    :class="{ 'invalid-field': formErrors.firstName }"
                >
                    <label for="firstName">Nome:</label>

                    <input
                        id="firstName"
                        type="text"
                        placeholder=""
                        autocomplete="nome"
                        v-model="form.firstName"
                        @input="delete formErrors.firstName"
                        required
                    />

                    <FieldErrors v-if="formErrors.firstName" :messages="formErrors.firstName" />
                </div>

                <!-- Last name -->
                <div class="field flex-1" :class="{ 'invalid-field': formErrors.lastName }">
                    <label for="lastName">Sobrenome:</label>

                    <input
                        id="lastName"
                        type="text"
                        placeholder=""
                        autocomplete="sobrenome"
                        v-model="form.lastName"
                        @input="delete formErrors.lastName"
                        required
                    />

                    <FieldErrors v-if="formErrors.lastName" :messages="formErrors.lastName" />
                </div>
            </div>

            <!-- Email -->
            <div class="field" :class="{ 'invalid-field': formErrors.email }">
                <label for="email">E-mail:</label>

                <input
                    id="email"
                    type="text"
                    placeholder=""
                    autocomplete="email"
                    v-model="form.email"
                    @input="delete formErrors.email"
                    required
                />

                <FieldErrors v-if="formErrors.email" :messages="formErrors.email" />
            </div>

            <!-- Password1 -->
            <div class="field" :class="{ 'invalid-field': formErrors.password1 }">
                <label for="password1">Senha:</label>

                <input
                    id="password1"
                    type="password"
                    placeholder=""
                    autocomplete="current-password"
                    v-model="form.password1"
                    @input="delete formErrors.password1"
                    required
                />

                <FieldErrors v-if="formErrors.password1" :messages="formErrors.password1" />
            </div>

            <!-- Password2 -->
            <div class="field" :class="{ 'invalid-field': formErrors.password2 }">
                <label for="password2">Senha novamente:</label>

                <input
                    id="password2"
                    type="password"
                    placeholder=""
                    autocomplete="current-password"
                    v-model="form.password2"
                    @input="delete formErrors.password2"
                    required
                />

                <FieldErrors v-if="formErrors.password2" :messages="formErrors.password2" />
            </div>

            <button type="submit" class="btn btn-blue mx-auto mt-4">
                <TextLoading text="CRIAR CONTA" :isLoading="isFormLoading" class="stroke-white" />
            </button>
        </form>

        <div class="relative mt-8 w-11/12 max-w-xs">
            <p class="text-center text-balance">
                Já possui uma conta?
                <RouterLink :to="{ name: 'public.login' }"> Faça o login </RouterLink>
            </p>
        </div>
    </section>
</template>

<script lang="ts" setup>
import { ref, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { type ModalType } from '@/components/alerts/ModalAlert.vue'
import InlineAlert, { type InlineType } from '@/components/alerts/InlineAlert.vue'
import FieldErrors from '@/components/form/FieldErrors.vue'
import TextLoading from '@/components/loading/TextLoading.vue'

const AsyncModalAlert = defineAsyncComponent(() => import('@/components/alerts/ModalAlert.vue'))

interface RegisterForm {
    firstName: string
    lastName: string
    email: string
    password1: string
    password2: string
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

const router = useRouter()
const alertInline = ref({
    message: '',
    key: 0,
    type: 'error' as InlineType,
})

const isFormLoading = ref(false)
const form = ref<RegisterForm>({
    firstName: '',
    lastName: '',
    email: '',
    password1: '',
    password2: '',
})
const formErrors = ref<{
    firstName?: string[]
    lastName?: string[]
    email?: string[]
    password1?: string[]
    password2?: string[]
}>({})
const modalAlert = ref<ModalSettings & { key: number }>({
    type: 'success',
    title: '',
    message: '',
    key: 0,
    okLabel: '',
    hasCancelButton: false,
    cancelLabel: '',
    okFunction: () => {},
})

function setAlertInline(msg: string, type: InlineType) {
    alertInline.value.message = msg
    alertInline.value.key++
    alertInline.value.type = type
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

function handleSubmit() {
    if (isFormLoading.value) return
    isFormLoading.value = true
    const formData = form.value

    axios
        .post('/api/account/create/form', {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            password1: formData.password1,
            password2: formData.password2,
        })
        .then(() => {
            form.value = {
                firstName: '',
                lastName: '',
                email: '',
                password1: '',
                password2: '',
            }
            setModalAlert({
                type: 'success',
                title: 'Sucesso',
                message: 'Usuário criado com sucesso com sucesso.',
                okLabel: 'Confirmar',
                hasCancelButton: false,
                cancelLabel: '',
                okFunction: () => {
                    router.replace({ name: 'public.login' })
                },
            })
        })
        .catch((error) => {
            isFormLoading.value = false

            if (error.code === 'ERR_NETWORK') {
                setModalAlert({
                    type: 'error',
                    title: 'Conexão instável',
                    message:
                        'Não foi possível conectar com servidor, por favor, tente' +
                        ' novamente mais tarde.',
                    okLabel: 'Confirmar',
                    hasCancelButton: false,
                    cancelLabel: '',
                    okFunction: () => {},
                })

                return
            }

            if (error.status === 400) {
                const responseErros = error.response.data.errors

                if (responseErros.__all__) {
                    setAlertInline(responseErros.__all__[0], 'error')
                }

                formErrors.value = {
                    email: responseErros.email || undefined,
                    password1: responseErros.password1 || undefined,
                    password2: responseErros.password2 || undefined,
                    firstName: responseErros.first_name || undefined,
                    lastName: responseErros.last_name || undefined,
                }

                return
            }

            console.error(error)
            setModalAlert({
                type: 'error',
                title: 'Erro inesperado',
                message:
                    'O servidor não conseguiu processar a solicitação,' +
                    ' por favor, contacte a nossa equipe.',
                okLabel: 'Confirmar',
                hasCancelButton: false,
                cancelLabel: '',
                okFunction: () => {},
            })
        })
}
</script>
