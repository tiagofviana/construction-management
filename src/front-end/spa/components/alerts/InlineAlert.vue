<template>
    <div
        ref="card"
        class="mx-auto w-full max-w-md overflow-hidden rounded border will-change-[height,margin,opacity]"
        :class="{
            'border-red-300/70 bg-red-100 brightness-95': isError,
            'border-blue-300/70 bg-blue-100 brightness-95': isInfo,
            'border-yellow-600/70 bg-yellow-100': isWarning,
            'border-green-400/80 bg-green-100 brightness-95': isSuccess,
        }"
    >
        <button
            aria-label="Fechar"
            type="button"
            @click="hide"
            class="float-right ml-2 cursor-pointer px-1.5 py-1"
            :class="{
                'text-red-700 hover:text-red-800': isError,
                'text-blue-500 hover:text-blue-800': isInfo,
                'text-yellow-600 hover:text-yellow-900': isWarning,
                'text-green-500 hover:text-green-800': isSuccess,
            }"
        >
            <X :stroke-width="3" :size="24" />
        </button>

        <p
            class="py-3 pl-4 break-normal hyphens-auto"
            :class="{
                'text-red-800': isError,
                'text-blue-800': isInfo,
                'text-yellow-800': isWarning,
                'text-green-800': isSuccess,
            }"
        >
            <strong v-if="isError"> Erro: </strong>
            <strong v-if="isInfo"> Aviso: </strong>
            <strong v-if="isWarning"> Atenção: </strong>
            <strong v-if="isSuccess"> Tudo certo: </strong>

            {{ message }}
        </p>
    </div>
</template>

<script lang="ts" setup>
import { useTemplateRef, computed, onMounted, PropType, watch } from 'vue'
import { X } from '@lucide/vue'
import { gsap } from 'gsap'

export type InlineType = 'info' | 'error' | 'success' | 'warning'

const props = defineProps({
    type: {
        type: String as PropType<InlineType>,
        required: false,
        default: 'info',
    },

    message: {
        type: String,
        required: true,
    },
})

const card = useTemplateRef<HTMLElement>('card')
const isError = computed(() => props.type === 'error')
const isInfo = computed(() => props.type === 'info')
const isWarning = computed(() => props.type === 'warning')
const isSuccess = computed(() => props.type === 'success')

watch(
    () => props.message,
    () => {
        gsap.to(card.value, {
            duration: 0.5,
            opacity: 0,
            height: 0,
            marginTop: 0,
            marginBottom: 0,
            onComplete: () => {
                card.value?.removeAttribute('style')
                show()
            },
        })
    },
)

const show = () => {
    gsap.from(card.value, {
        duration: 0.5,
        opacity: 0,
        height: 0,
        marginTop: 0,
        marginBottom: 0,
    })
}

const hide = () => {
    gsap.to(card.value, {
        duration: 0.5,
        opacity: 0,
        height: 0,
        marginTop: 0,
        marginBottom: 0,
    })
}

onMounted(() => {
    show()
})
</script>
