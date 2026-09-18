<template>
    <section v-if="firstName" class="flex min-h-dvh flex-col items-center justify-center py-6">
        <AsyncModalAlert
            v-if="modalAlert.message"
            type="error"
            :title="modalAlert.title"
            :message="modalAlert.message"
            ok-label="Confirmar"
            :has-cancel-button="false"
            :key="modalAlert.key"
            @ok="modalAlert.okFunction"
        />

        <form
            @submit.prevent="handleSubmit()"
            class="w-11/12 max-w-sm rounded-md border border-black/10 bg-white p-6"
        >
            <h1 class="py-4 text-center font-serif text-4xl font-bold">Alterar senha</h1>

            <p class="text-center text-pretty">
                Olá, <strong> {{ firstName }} </strong>. Preencha o formulario com a sua nova senha.
            </p>

            <InlineAlert
                v-if="inlineAlert.message"
                :message="inlineAlert.message"
                :type="inlineAlert.type"
                :key="inlineAlert.key"
            />

            <!-- Password1 -->
            <div class="field mt-1" :class="{ 'invalid-field': formErrors.password1 }">
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
                <TextLoading text="SALVAR" :isLoading="isFormLoading" class="stroke-white" />
            </button>
        </form>
    </section>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, onBeforeMount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import InlineAlert, { type InlineType } from '@/components/alerts/InlineAlert.vue'
import FieldErrors from '@/components/form/FieldErrors.vue'
import TextLoading from '@/components/loading/TextLoading.vue'

const AsyncModalAlert = defineAsyncComponent(() => import('@/components/alerts/ModalAlert.vue'))

const route = useRoute()
const router = useRouter()
const uid = route.params.uid
const token = route.params.token
const firstName = ref<string>('')
const form = ref({
    password1: '',
    password2: '',
})
const isFormLoading = ref(false)
const formErrors = ref<{
    password1?: string[]
    password2?: string[]
}>({})

const modalAlert = ref({
    type: 'info' as InlineType,
    message: '',
    key: 0,
    title: '',
    okFunction: () => {},
})

const inlineAlert = ref<{ message: string; key: number; type: InlineType }>({
    message: '',
    key: 0,
    type: 'error',
})

onBeforeMount(async () => {
    await axios
        .get(`/api/account/validate-change-password/${uid}/${token}/form`)
        .then((response) => {
            firstName.value = response.data.firstName
        })
})

function setModalAlert(type: InlineType, title: string, msg: string, okFunction: () => void) {
    modalAlert.value = {
        message: msg,
        type: type,
        key: modalAlert.value.key + 1,
        title: title,
        okFunction: okFunction,
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
    const formData = form.value

    axios
        .post(`/api/account/change-password/${uid}/${token}/form`, {
            password1: formData.password1,
            password2: formData.password2,
        })
        .then(() => {
            router.replace({ name: 'public.login' })

            form.value = {
                password1: '',
                password2: '',
            }
            setModalAlert('success', 'Senha alterada com sucesso.', 'Verifique seu e-mail', () => {
                router.replace({ name: 'public.login' })
            })
        })
        .catch((error) => {
            isFormLoading.value = false

            if (error.code === 'ERR_NETWORK') {
                setModalAlert(
                    'error',
                    'Não foi possível conectar com servidor, por favor, tente novamente mais tarde.',
                    'Conexão instável',
                    () => {},
                )
                return
            }

            if (error.status === 400) {
                const responseErros = error.response.data.errors

                if (responseErros.__all__) {
                    setInlineAlert(responseErros.__all__[0], 'error')
                }

                formErrors.value = {
                    password1: responseErros.password1 || undefined,
                    password2: responseErros.password2 || undefined,
                }

                return
            }

            console.error(error)
            setModalAlert(
                'error',
                'O servidor não conseguiu processar a solicitação, por favor, contacte a nossa equipe.',
                'Erro inesperado',
                () => {},
            )
        })
}
</script>
