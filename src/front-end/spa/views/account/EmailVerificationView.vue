<template>
    <section class="flex min-h-dvh flex-col items-center justify-center">
        <form
            class="mx-auto w-11/12 max-w-md overflow-hidden rounded-md border border-black/10 bg-white p-6 shadow shadow-black/20"
        >
            <h1 class="py-4 text-center font-serif text-4xl font-bold">Vericação de email</h1>

            <p class="mt-4 text-center text-gray-600" v-if="info">
                Por favor, insira o código de verificação que enviamos para
                <strong class="font-bold text-gray-800">{{ info?.email }}</strong>
            </p>

            <InlineAlert
                v-if="inlineAlert.message"
                :message="inlineAlert.message"
                :type="inlineAlert.type"
                :key="inlineAlert.key"
            />

            <div class="mx-auto mt-4 flex flex-row items-center justify-center gap-2">
                <input
                    v-for="(digit, index) in emailCode"
                    :key="index"
                    type="text"
                    maxlength="1"
                    class="h-10 w-7 rounded-md border border-gray-400 text-center focus:ring-2 focus:ring-sky-500"
                    v-model="emailCode[index]"
                    @input="handleInput(index, $event)"
                    @keydown="handleKeyboard(index, $event)"
                />
            </div>

            <button
                disabled
                type="button"
                ref="confirmButton"
                class="btn btn-blue mx-auto mt-4 px-6"
                @click="submit()"
            >
                <TextLoading text="CONFIRMAR" :isLoading="isLoadingConfirm" class="stroke-white" />
            </button>
        </form>

        <div class="mt-8 w-11/12 max-w-xs">
            <p>
                Clique

                <TextLoading
                    text="aqui"
                    :isLoading="isLoadingSendEmail"
                    class="inline cursor-pointer stroke-blue-700 text-blue-700 hover:underline"
                    @click="sendEmail()"
                />

                para enviar o email novamente
            </p>

            <hr class="mt-6 border border-black/20" />
            <span class="mx-auto -mt-3 table bg-gray-100 px-1 text-gray-400">OU</span>

            <RouterLink
                :to="{ name: 'public.logout' }"
                class="mx-auto mt-2 mb-4 table text-blue-700 no-underline hover:underline"
            >
                Sair
            </RouterLink>
        </div>
    </section>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { accountStore, AccountInfo } from '@/stores/account'
import InlineAlert, { type InlineType } from '@/components/alerts/InlineAlert.vue'
import TextLoading from '@/components/loading/TextLoading.vue'

const router = useRouter()
const account = accountStore()
const confirmButton = useTemplateRef<HTMLButtonElement>('confirmButton')
const info = ref<AccountInfo | null>(null)
const inlineAlert = ref({
    message: '',
    key: 0,
    type: 'error' as InlineType,
})
const emailCode = ref<Array<string>>(['', '', '', '', '', ''])
const isLoadingSendEmail = ref<boolean>(false)
const isLoadingConfirm = ref<boolean>(false)

onBeforeMount(async () => {
    info.value = await account.getInfo()
    sendEmail()
})

function setInlineAlert(msg: string, type: InlineType) {
    inlineAlert.value.message = msg
    inlineAlert.value.key++
    inlineAlert.value.type = type
}

function handleInput(index: number, event: Event) {
    const input = event.target as HTMLInputElement
    const nextInput = input.nextElementSibling as HTMLInputElement | null
    nextInput?.focus()

    const joinedCode = emailCode.value.join('')

    if (confirmButton.value) {
        confirmButton.value.disabled = joinedCode.length !== 6
    }
}

function handleKeyboard(index: number, event: KeyboardEvent) {
    const input = event.target as HTMLInputElement

    switch (event.key) {
        case 'Backspace': {
            event.preventDefault()

            if (input.value !== '') {
                emailCode.value[index] = ''
            } else {
                if (index > 0) emailCode.value[index - 1] = ''
                const prevInput = input.previousElementSibling as HTMLInputElement | null
                prevInput?.focus()
            }
            confirmButton.value!.disabled = true
            break
        }

        case 'Delete': {
            event.preventDefault()
            emailCode.value[index] = ''
            const nextInput = input.nextElementSibling as HTMLInputElement | null
            nextInput?.focus()
            confirmButton.value!.disabled = true
            break
        }

        case 'ArrowRight': {
            event.preventDefault()
            const nextInput = input.nextElementSibling as HTMLInputElement | null
            nextInput?.focus()
            break
        }

        case 'ArrowLeft': {
            event.preventDefault()
            const prevInput = input.previousElementSibling as HTMLInputElement | null
            prevInput?.focus()
            break
        }

        case 'Enter': {
            event.preventDefault()

            const joinedCode = emailCode.value.join('')

            if (joinedCode.length === 6) {
                submit()
            }

            break
        }

        default: {
            emailCode.value[index] = ''
        }
    }
}

async function submit() {
    if (isLoadingConfirm.value === true) return

    isLoadingConfirm.value = true
    axios
        .post('/api/account/email-verification/verify', {
            code: emailCode.value.join(''),
        })
        .then(async (response) => {
            if (response.status === 409) {
                setInlineAlert('Código inválido, tente novamente.', 'error')
                return
            }

            if (response.status === 200) {
                account.reset()
                router.push({ name: 'public.redirect', params: { animate: 1 } })
            }
        })
        .finally(() => {
            isLoadingConfirm.value = false
        })
}

async function sendEmail() {
    if (isLoadingSendEmail.value === true) return
    isLoadingSendEmail.value = true

    axios
        .get('/api/account/email-verification/send')
        .then((response) => {
            if (response.status === 409) {
                router.push({ name: 'public.redirect' })
            }

            if (response.status === 204) {
                setInlineAlert(
                    'Você alcançou o limite de envios de email, aguarde 24 horas para tentar novamente. Recomendamos entrar em contato com a nossa equipe.',
                    'error',
                )
                isLoadingSendEmail.value = false
                return
            }

            if (response.status === 200) {
                setInlineAlert('Um email com o código foi enviado para o seu email.', 'success')
            }
        })
        .finally(() => {
            isLoadingSendEmail.value = false
        })
}
</script>
