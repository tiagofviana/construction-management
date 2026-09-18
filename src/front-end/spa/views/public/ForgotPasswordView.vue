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
        >
            <h1 class="py-4 text-center font-serif text-4xl font-bold">Recuperar senha</h1>

            <p class="pb-4 text-center text-balance">
                Informe o e-mail da sua conta e enviaremos um link para você criar uma nova senha.
            </p>

            <InlineAlert
                v-if="inlineAlert.message"
                :message="inlineAlert.message"
                :type="inlineAlert.type"
                :key="inlineAlert.key"
            />

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

            <button type="submit" class="btn btn-blue mx-auto mt-4">
                <TextLoading text="ENVIAR LINK" :isLoading="isFormLoading" class="stroke-white" />
            </button>
        </form>

        <div class="relative mt-8 w-11/12 max-w-xs">
            <p class="text-center text-balance">
                Lembrou da sua senha?
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

interface ForgotPasswordForm {
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

const router = useRouter()
const inlineAlert = ref({
    message: '',
    key: 0,
    type: 'error' as InlineType,
})

const isFormLoading = ref(false)
const form = ref<ForgotPasswordForm>({
    email: '',
})
const formErrors = ref<{
    email?: string[]
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

function setInlineAlert(msg: string, type: InlineType) {
    inlineAlert.value.message = msg
    inlineAlert.value.key++
    inlineAlert.value.type = type
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
        .post('/api/account/forgot-password/form', {
            email: formData.email,
        })
        .then(() => {
            form.value = {
                email: '',
            }
            setModalAlert({
                type: 'info',
                title: 'Verifique seu e-mail',
                message:
                    'Se houver uma conta com esse e-mail, você receberá um link para' +
                    ' criar uma nova senha. O link expira em algumas horas.',
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
                    setInlineAlert(responseErros.__all__[0], 'error')
                }

                formErrors.value = {
                    email: responseErros.email || undefined,
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
