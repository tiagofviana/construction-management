<template>
    <section
        v-if="!isHidden"
        class="fixed top-0 left-0 z-90 h-dvh w-full overflow-auto bg-black/80 py-12"
    >
        <div class="mx-auto w-11/12 max-w-xl rounded bg-white pb-4">
            <button type="button" @click="isHidden = true" class="ml-auto block">
                <X
                    :size="36"
                    :strokeWidth="2"
                    aria-label="Fechar"
                    class="boder-l ml-auto cursor-pointer stroke-gray-400 p-1 hover:stroke-black"
                />
            </button>

            <hr class="h-px bg-gray-200" />

            <div class="mx-auto px-10 pt-2">
                <InlineAlert
                    v-if="inlineAlert.message"
                    status="error"
                    :message="inlineAlert.message"
                    :key="inlineAlert.key"
                />

                <div ref="container" class="cropper-container"></div>

                <button
                    type="button"
                    aria-label="Cortar"
                    @click="crop()"
                    class="btn btn-blue mx-auto mt-4"
                >
                    Cortar
                </button>
            </div>
        </div>
    </section>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef, onBeforeUnmount, onMounted } from 'vue'
import Cropper, { type CropperSelection, type CropperCanvas } from 'cropperjs'
import { X } from '@lucide/vue'
import InlineAlert from '@/components/alerts/InlineAlert.vue'

const props = defineProps({
    width: {
        type: Number,
        required: true,
    },
    height: {
        type: Number,
        required: true,
    },
    data: {
        type: String,
        required: true,
    },
})

const emit = defineEmits<{
    (e: 'file', payload: File): void
}>()

const inlineAlert = ref({ message: '', key: 0 })
let cropper: Cropper | null = null
const container = useTemplateRef('container')
const isHidden = ref(false)
const MAX_WIDTH = 128

onMounted(() => {
    const image = new Image()
    image.src = props.data
    const containerElmt = container.value as HTMLDivElement

    cropper = new Cropper(image, {
        container: containerElmt,
        template: `
        <cropper-canvas background>
            <cropper-image
                movable="false"
                zoomable="false"
                rotatable="false"
                scalable="false"
            ></cropper-image>

            <cropper-shade theme-color="rgba(0, 0, 0, 0.8)"></cropper-shade>

            <cropper-handle action="select" plain></cropper-handle>
            
            <cropper-selection
                aspect-ratio="${props.width / props.height}"
                initial-coverage="0.5"
                movable="true"
                resizable="true"
            >   
                <cropper-grid role="grid" bordered covered></cropper-grid>
                <cropper-crosshair centered></cropper-crosshair>
                <cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.25)"></cropper-handle>
                <cropper-handle action="ne-resize"></cropper-handle>
                <cropper-handle action="nw-resize"></cropper-handle>
                <cropper-handle action="se-resize"></cropper-handle>
                <cropper-handle action="sw-resize"></cropper-handle>
            </cropper-selection>
        </cropper-canvas>
        `,
    })

    const cropperCanvas = cropper.getCropperCanvas() as CropperCanvas
    const cropperSelection = cropper.getCropperSelection() as CropperSelection

    cropperSelection.addEventListener('change', (event) => {
        const detail = (event as CustomEvent).detail
        const canvasRect = cropperCanvas.getBoundingClientRect()

        if (detail.width < MAX_WIDTH) {
            event.preventDefault()
            cropperSelection.width = MAX_WIDTH
        }

        if (
            detail.x < 0 ||
            detail.y < 0 ||
            cropperSelection.width + detail.x > canvasRect.width ||
            detail.y + cropperSelection.height > canvasRect.height
        ) {
            event.preventDefault()
        }
    })
})

onBeforeUnmount(() => {
    if (cropper !== null) {
        cropper.destroy()
        cropper = null
    }
})

function setAlertMessage(msg: string) {
    inlineAlert.value = {
        message: msg,
        key: inlineAlert.value.key + 1,
    }
}

function crop() {
    if (cropper === null) return

    cropper
        .getCropperSelection()
        ?.$toCanvas({
            width: props.width,
            height: props.height,
        })
        .then((canvasElmt) => {
            const file = createFile(canvasElmt.toDataURL('image/webp'))
            emit('file', file)
            isHidden.value = true
        })
        .catch((error) => {
            setAlertMessage(`Não foi possível cortar a imagem. Erro: ${error}.`)
        })
}

function createFile(data: string): File {
    const decode = data.split(',')[1]
    const enconded = atob(decode)
    let size = enconded.length
    const u8data = new Uint8Array(size)
    while (size--) {
        u8data[size] = enconded.charCodeAt(size)
    }

    return new File([u8data], 'image.webp', { type: 'image/webp' })
}
</script>

<style lang="scss" scoped>
.cropper-container {
    border: 1px solid rgba(0, 0, 0, 0.3);
    width: 100%;
    aspect-ratio: 1;
}

:deep(cropper-image) {
    border: 1px solid rgba(0, 0, 0, 0.3);
}

:deep(cropper-canvas) {
    width: 100%;
    height: 100%;
}
</style>
