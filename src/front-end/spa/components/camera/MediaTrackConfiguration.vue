<template>
    <section
        v-if="Object.keys(trackConfig).length > 0"
        class="rounded-b-lg border border-gray-300 bg-white p-3"
    >
        <h3 class="flex flex-row items-center justify-start text-3xl font-bold">
            <SlidersHorizontal :size="30" class="mr-3 stroke-red-700" />
            Configuração da câmera
        </h3>

        <div class="mt-3">
            <InlineAlert
                v-if="alert.message"
                type="error"
                :message="alert.message"
                :key="alert.key"
            />

            <label v-if="trackConfig.exposureTime">
                Tempo de exposição ({{ Math.round(trackConfig.exposureTime.value) }}/{{
                    trackConfig.exposureTime.max
                }}):
                <input
                    type="range"
                    :min="trackConfig.exposureTime.min"
                    :max="trackConfig.exposureTime.max"
                    :step="trackConfig.exposureTime.step"
                    v-model="trackConfig.exposureTime.value"
                    class="w-full"
                />
            </label>

            <label v-if="trackConfig.exposureCompensation">
                Compensação de exposição ({{ trackConfig.exposureCompensation.value }}/{{
                    trackConfig.exposureCompensation.max
                }}):
                <input
                    type="range"
                    :min="trackConfig.exposureCompensation.min"
                    :max="trackConfig.exposureCompensation.max"
                    :step="trackConfig.exposureCompensation.step"
                    v-model="trackConfig.exposureCompensation.value"
                    class="w-full"
                />
            </label>

            <label v-if="trackConfig.iso">
                ISO ({{ trackConfig.iso.value }}/{{ trackConfig.iso.max }}):
                <input
                    type="range"
                    :min="trackConfig.iso.min"
                    :max="trackConfig.iso.max"
                    :step="trackConfig.iso.step"
                    v-model="trackConfig.iso.value"
                    class="w-full"
                />
            </label>

            <label v-if="trackConfig.brightness">
                Brilho ({{ trackConfig.brightness.value }}/{{ trackConfig.brightness.max }}):
                <input
                    type="range"
                    :min="trackConfig.brightness.min"
                    :max="trackConfig.brightness.max"
                    :step="trackConfig.brightness.step"
                    v-model="trackConfig.brightness.value"
                    class="w-full"
                />
            </label>

            <label v-if="trackConfig.zoom">
                Zoom ({{ trackConfig.zoom.value }}/{{ trackConfig.zoom.max }}):
                <input
                    type="range"
                    :min="trackConfig.zoom.min"
                    :max="trackConfig.zoom.max"
                    :step="trackConfig.zoom.step"
                    v-model="trackConfig.zoom.value"
                    class="w-full"
                />
            </label>

            <button
                type="button"
                class="btn btn-gray mx-auto mt-4 rounded-full px-6"
                @click="applyConfig"
            >
                Aplicar
            </button>
        </div>
    </section>
</template>

<script setup lang="ts">
import { reactive, onMounted, computed, ref } from 'vue'
import { SlidersHorizontal } from '@lucide/vue'
import InlineAlert from '@/components/alerts/InlineAlert.vue'

const props = defineProps({
    videoTrack: { type: MediaStreamTrack, required: true },
})

const alert = ref({
    message: '',
    key: 0,
})
const trackCapabilities = computed(() => props.videoTrack.getCapabilities())
const trackSettings = computed(() => props.videoTrack.getSettings())

interface configI {
    value: number
    min: number
    max: number
    step: number
}
const trackConfig = reactive<Record<string, configI>>({})

onMounted(() => {
    prepareConfigurations()
})

async function prepareConfigurations() {
    changeTrackModes()
    setTrackConfig('focusDistance')
    setTrackConfig('exposureTime')
    setTrackConfig('exposureCompensation')
    setTrackConfig('brightness')
    setTrackConfig('iso')
    setTrackConfig('zoom')
}

function setInlineAlertMessage(message: string) {
    alert.value = {
        message: message,
        key: alert.value.key++,
    }
}

async function changeTrackModes() {
    const modes: Record<string, string> = {}

    if ('exposureMode' in trackCapabilities.value) modes.exposureMode = 'manual'
    if ('focusMode' in trackCapabilities.value) modes.focusMode = 'manual'

    await props.videoTrack
        .applyConstraints({
            advanced: [modes as MediaTrackConstraintSet],
        })
        .catch((err) => {
            console.error(err)
            setInlineAlertMessage(`Erro ao alterar a câmera para o modo manual. Erro: ${err}`)
        })
}

function setTrackConfig(name: string) {
    if (!(name in trackCapabilities.value)) return
    if (!(name in trackSettings.value)) return

    const capability =
        (trackCapabilities.value[name as keyof MediaTrackCapabilities] as object) || {}

    if (!('max' in capability && 'min' in capability && 'step' in capability)) return

    trackConfig[name] = {
        value: trackSettings.value[name as keyof MediaTrackSettings] as number,
        min: capability.min as number,
        max: capability.max as number,
        step: Math.round(capability.step as number),
    }
}

async function applyConfig() {
    const keys = Object.keys(trackConfig)
    const contraints: Record<string, number> = {}

    keys.forEach((key) => {
        let value = trackConfig[key].value
        value = value > trackConfig[key].min ? value : trackConfig[key].min
        value = value < trackConfig[key].max ? value : trackConfig[key].max
        contraints[key] = value
    })

    console.debug('Trying to apply constraints: ', contraints)

    await props.videoTrack
        .applyConstraints({
            advanced: [contraints as MediaTrackConstraintSet],
        })
        .catch((err) => {
            console.error(err)
            setInlineAlertMessage(
                `Erro ao aplicar as configurações, contact a equipe. Erro: ${err}`,
            )
        })
}
</script>
