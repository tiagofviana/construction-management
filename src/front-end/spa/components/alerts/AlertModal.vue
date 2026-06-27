<template>
    <Teleport to="body">
        <section
            v-if="visible"
            class="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm select-none"
            @click.self="handleOverlayClick()"
        >
            <div
                ref="cardRef"
                role="alertdialog"
                aria-modal="true"
                class="w-11/12 max-w-md rounded-lg bg-white shadow-2xl"
            >
                <div v-if="title" class="flex items-center gap-3.5 p-5">
                    <div>
                        <component
                            :is="iconComponent"
                            style="transform: scaleX(-1)"
                            :class="{
                                'stroke-blue-600': props.type === 'info',
                                'stroke-red-600': props.type === 'error',
                                'stroke-green-600': props.type === 'success',
                            }"
                            :size="32"
                            :stroke-width="1.5"
                        />
                    </div>

                    <h2 class="line-clamp-1 text-xl font-bold text-neutral-900">
                        {{ title }}
                    </h2>
                </div>

                <hr v-if="title" class="border-gray-100" />

                <p class="px-5 py-6">{{ message }}</p>

                <hr class="border-gray-100" />

                <div class="flex flex-col justify-end gap-5 p-5 pt-4 sm:flex-row">
                    <button
                        v-if="props.hasCancelButton"
                        class="btn btn-white"
                        @click="handleCancel"
                    >
                        {{ cancelLabel }}
                    </button>

                    <button class="btn" :class="confirmBtnClass" @click="handleOk()">
                        {{ confirmLabel }}
                    </button>
                </div>
            </div>
        </section>
    </Teleport>
</template>

<script lang="ts" setup>
import { ref, computed, useTemplateRef, onMounted } from 'vue'
import type { PropType } from 'vue'
import { MessageCircleX, MessageCircleMore, MessageCircleCheck } from '@lucide/vue'
import { gsap } from 'gsap'

export type ModalType = 'info' | 'error' | 'success'

const props = defineProps({
    type: {
        type: String as PropType<ModalType>,
        required: true,
    },
    title: {
        type: String,
        required: false,
    },
    message: {
        type: String,
        required: true,
    },
    confirmLabel: {
        type: String,
        default: 'Confirmar',
    },
    hasCancelButton: {
        type: Boolean,
        required: true,
    },
    cancelLabel: {
        type: String,
        default: 'Cancelar',
    },
})

const emit = defineEmits(['ok', 'cancel'])

const visible = ref(true)
const cardRef = useTemplateRef('cardRef')

const confirmBtnClass = computed(() => {
    const map = {
        info: 'btn-blue',
        error: 'btn-red',
        success: 'btn-green',
    }
    return map[props.type] ?? 'btn-blue'
})

const iconComponent = computed(() => {
    const icons = {
        info: MessageCircleMore,
        error: MessageCircleX,
        success: MessageCircleCheck,
    }
    return icons[props.type] ?? MessageCircleMore
})

function animateIn(callback: () => void) {
    gsap.fromTo(
        cardRef.value,
        { opacity: 0, scale: 0.85, y: -24 },
        {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.35,
            ease: 'back.out(1.6)',
            onComplete: callback,
        },
    )
}

onMounted(() => {
    animateIn(() => {})
})

function animateOut(callback: () => void) {
    gsap.to(cardRef.value, {
        opacity: 0,
        scale: 0.9,
        y: 16,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: callback,
    })
}

function shakeCard() {
    gsap.timeline({
        defaults: { duration: 0.07, ease: 'power2.inOut' },
    })
        .to(cardRef.value, { x: -10 })
        .to(cardRef.value, { x: 10 })
        .to(cardRef.value, { x: -8 })
        .to(cardRef.value, { x: 8 })
        .to(cardRef.value, { x: 0, duration: 0.05, ease: 'power2.out' })
}

function handleOk() {
    animateOut(() => {
        visible.value = false
        emit('ok')
    })
}

function handleCancel() {
    animateOut(() => {
        visible.value = false
        emit('cancel')
    })
}

function handleOverlayClick() {
    shakeCard()
}
</script>
