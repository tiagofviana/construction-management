<template>
    <section class="flex min-h-dvh flex-col items-center justify-center py-6">
        <AsyncModalAlert
            v-if="alertModal.message"
            type="error"
            :title="alertModal.title"
            :message="alertModal.message"
            ok-label="Confirmar"
            :has-cancel-button="false"
            :key="alertModal.key"
        />

        <form
            @submit.prevent="handleSubmit()"
            class="w-11/12 max-w-sm rounded-md border border-black/10 bg-white p-6"
        >
            <h1 class="py-4 text-center font-serif text-4xl font-bold">Login</h1>

            <InlineAlert
                v-if="alertInline.message"
                :message="alertInline.message"
                :type="alertInline.type"
                :key="alertInline.key"
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

            <!-- Password -->
            <div class="field" :class="{ 'invalid-field': formErrors.password }">
                <label for="password">Senha:</label>

                <input
                    id="password"
                    type="password"
                    placeholder=""
                    autocomplete="current-password"
                    v-model="form.password"
                    @input="delete formErrors.password"
                    required
                />

                <FieldErrors v-if="formErrors.password" :messages="formErrors.password" />
            </div>

            <!-- Stay connected -->
            <div class="checkbox mt-6">
                <label>
                    <input type="checkbox" v-model="form.stayConnected" />
                    Permanecer conectado
                </label>
            </div>

            <button type="submit" class="btn btn-blue mx-auto mt-4">
                <TextLoading text="ACESSAR" :isLoading="isFormLoading" class="stroke-white" />
            </button>
        </form>

        <div class="relative mt-8 w-11/12 max-w-xs">
            <RouterLink :to="{ name: 'public.forgot-password' }" class="mx-auto table">
                Esqueceu sua senha?
            </RouterLink>

            <hr class="mt-6 border border-black/20" />
            <span class="mx-auto -mt-3 table bg-gray-100 px-2 text-gray-400">OU</span>

            <RouterLink :to="{ name: 'public.account-create' }" class="mx-auto mt-2 mb-4 table">
                Crie uma conta
            </RouterLink>
        </div>
    </section>
</template>

<script lang="ts" setup>
import { ref, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import InlineAlert, { type InlineType } from '@/components/alerts/InlineAlert.vue'
import FieldErrors from '@/components/form/FieldErrors.vue'
import TextLoading from '@/components/loading/TextLoading.vue'

const AsyncModalAlert = defineAsyncComponent(() => import('@/components/alerts/ModalAlert.vue'))

interface LoginForm {
    email: string
    password: string
    stayConnected: boolean
}

const form = ref<LoginForm>({
    email: 'func@email.com',
    password: '1234asdf1',
    stayConnected: false,
})
const router = useRouter()
const isFormLoading = ref(false)
const formErrors = ref<{
    email?: string[]
    password?: string[]
}>({})

const alertModal = ref<{ message: string; key: number; title: string }>({
    message: '',
    key: 0,
    title: '',
})

const alertInline = ref<{ message: string; key: number; type: InlineType }>({
    message: '',
    key: 0,
    type: 'error',
})

function setModalAlert(msg: string, title: string) {
    alertModal.value = {
        message: msg,
        key: alertModal.value.key + 1,
        title: title,
    }
}

function setInlineAlert(msg: string, type: InlineType) {
    alertInline.value.message = msg
    alertInline.value.key++
    alertInline.value.type = type
}

function handleSubmit() {
    if (isFormLoading.value) return
    isFormLoading.value = true
    const formData = form.value

    axios
        .post('/api/account/login/form', {
            username: formData.email,
            password: formData.password,
            stay_connected: formData.stayConnected,
        })
        .then(() => {
            router.replace({ name: 'public.redirect', params: { animate: 1 } })
        })
        .catch((error) => {
            isFormLoading.value = false

            if (error.code === 'ERR_NETWORK') {
                setModalAlert(
                    'Não foi possível conectar com servidor, por favor, tente novamente mais tarde.',
                    'Conexão instável',
                )
                return
            }

            if (error.status === 400) {
                const responseErros = error.response.data.errors

                if (responseErros.__all__) {
                    setInlineAlert(responseErros.__all__[0], 'error')
                }

                formErrors.value = {
                    password: responseErros.password || undefined,
                    email: responseErros.username || undefined,
                }

                return
            }

            console.error(error)
            setModalAlert(
                'O servidor não conseguiu processar a solicitação, por favor, contacte a nossa equipe.',
                'Erro inesperado',
            )
        })
}
</script>
