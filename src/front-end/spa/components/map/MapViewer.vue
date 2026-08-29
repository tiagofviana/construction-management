<template>
    <section class="w-full bg-gray-300">
        <AsyncModalAlert
            v-if="modalAlert.message"
            :type="modalAlert.type"
            :title="modalAlert.title"
            :message="modalAlert.message"
            ok-label="Confirmar"
            :has-cancel-button="false"
            :key="modalAlert.key"
        />

        <div class="max-h-content min-h-content relative h-full pt-px">
            <div class="absolute top-0 left-0 z-10 m-2 w-full max-w-46">
                <SelectField
                    @value="(v) => (selectedFloor = v)"
                    inputName="floor"
                    placeholder="Selecione o andar"
                    :options="selectOptions"
                    class="w-full shadow shadow-black/20"
                />
            </div>

            <div class="flex size-full flex-row">
                <div class="relative flex-1">
                    <div ref="container" class="size-full"></div>

                    <div
                        class="absolute top-0 right-0 bottom-0 left-0 inset-shadow-sm inset-shadow-black/30"
                        style="pointer-events: none"
                    ></div>

                    <SimpleLoader
                        v-if="isLoadingRooms"
                        :size="44"
                        class="absolute top-1/2 left-1/2 z-1 -translate-1/2 stroke-gray-700"
                    />
                </div>

                <aside
                    class="flex h-full w-full max-w-56 flex-col overflow-hidden border-l border-black/10 bg-white"
                >
                    <template v-if="isMapReady && viewerCanvas">
                        <div
                            class="flex h-12 items-center justify-center border-b border-slate-200"
                        >
                            <h2 class="px-4 text-lg">Cômodos</h2>
                        </div>

                        <div class="flex flex-1 flex-col">
                            <RoomList
                                ref="room-list"
                                v-if="isLoadingRooms === false"
                                :rooms="rooms"
                                :floor-id="Number(selectedFloor)"
                                :employee-id="Number(employeeId)"
                            />
                        </div>

                        <div
                            class="mt-auto flex shrink-0 flex-col gap-2 border-t border-black/10 p-4"
                        >
                            <RouterLink
                                :to="{
                                    name: 'employee.floor-editor',
                                    params: {
                                        employeeId: props.employeeId,
                                        floorId: selectedFloor,
                                    },
                                }"
                                class="btn btn-gray"
                            >
                                Editar</RouterLink
                            >
                        </div>
                    </template>
                </aside>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import {
    onMounted,
    onBeforeUnmount,
    ref,
    watch,
    defineAsyncComponent,
    useTemplateRef,
    shallowRef,
    computed,
} from 'vue'
import axios from 'axios'
import { Map } from '@lucide/vue'
import RoomList from '@/components/map/modules/viewer/RoomList.vue'
import SelectField, { Option } from '@/components/form/SelectField.vue'
import type { ModalType } from '@/components/alerts/ModalAlert.vue'
import SimpleLoader from '@/components/loading/SimpleLoader.vue'
import { ViewerCanvas } from '@/components/map/modules/viewer'
import type { Room } from '@/components/map/modules/types'

const AsyncModalAlert = defineAsyncComponent(() => import('@/components/alerts/ModalAlert.vue'))

interface Floor {
    id: number
    name: string
}

const props = defineProps({
    employeeId: {
        type: Number,
        required: true,
    },
})

const selectOptions = ref<Array<Option>>([])
const selectedFloor = ref<string>('')
const rooms = ref<Array<Room>>([])
const isLoadingRooms = ref<boolean>(false)
const container = useTemplateRef('container')
const roomList = useTemplateRef('room-list')
const viewerCanvas = shallowRef<null | ViewerCanvas>(null)

const isMapReady = computed(() => {
    if (selectedFloor.value === '') {
        return false
    }

    if (isLoadingRooms.value === true) {
        return false
    }

    return true
})

const modalAlert = ref<{ message: string; key: number; title: string; type: ModalType }>({
    message: '',
    key: 0,
    title: '',
    type: 'success',
})

onMounted(async () => {
    const elm = container.value as HTMLDivElement
    const vc = new ViewerCanvas(elm)
    vc.setShapeDoubleClick((value) => {
        roomList.value?.goTo(value)
    })

    viewerCanvas.value = vc

    axios.get(`/api/employee/${props.employeeId}/floors-list`).then((response) => {
        const data = response.data as Array<Floor>
        selectOptions.value = data.map(({ id, name }) => ({
            value: id.toString(),
            name: name,
            icon: { component: Map },
        }))
    })
})

onBeforeUnmount(() => {
    viewerCanvas.value?.destroy()
    viewerCanvas.value = null
})

watch(selectedFloor, async (newValue) => {
    if (!newValue) return

    loadRooms()
})

function loadRooms() {
    isLoadingRooms.value = true
    axios
        .get(`/api/employee/${props.employeeId}/floor/${selectedFloor.value}/data`)
        .then((response) => {
            const data = response.data

            rooms.value = data.rooms as Array<Room>

            viewerCanvas.value?.setMapSize(data.floorSettings)
            viewerCanvas.value?.setRooms(rooms.value)

            viewerCanvas.value?.eventsHandler.zoom.reset()
            viewerCanvas.value?.eventsHandler.pan.centralize()
        })
        .finally(() => {
            isLoadingRooms.value = false
        })
}
</script>
