<template>
    <div class="p-4">
        <div class="mb-4 flex gap-2">
            <button class="border px-4 py-2" @click="tool = 'line'">Linha</button>

            <button class="border px-4 py-2" @click="tool = 'arc'">Arco</button>

            <button class="border px-4 py-2" @click="clearAll">Limpar</button>
        </div>

        <div ref="container" class="h-[700px] w-full border border-black" />

        <div class="mt-4">
            <h3 class="font-bold">SVG Path</h3>

            <textarea class="w-full border p-2" rows="4" readonly :value="svgPath" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import Konva from 'konva'

type Tool = 'line' | 'arc'

interface Point {
    x: number
    y: number
}

interface LineSegment {
    type: 'L'
    start: Point
    end: Point
}

interface ArcSegment {
    type: 'A'
    start: Point
    end: Point
    radius: number
    largeArc: 0 | 1
    sweep: 0 | 1
}

type Segment = LineSegment | ArcSegment

const container = useTemplateRef('container')

const tool = ref<Tool>('line')

const points = ref<Point[]>([])
const segments = ref<Segment[]>([])

let stage: Konva.Stage | null = null
let layer: Konva.Layer | null = null

onMounted(() => {
    initKonva()
})

onUnmounted(() => {
    stage?.destroy()
})

function initKonva() {
    const el = container.value!

    stage = new Konva.Stage({
        container: el,
        width: el.clientWidth,
        height: el.clientHeight,
    })

    layer = new Konva.Layer()

    stage.add(layer)

    stage.on('click', handleClick)
}

function handleClick() {
    if (!stage) return

    const pos = stage.getPointerPosition()

    if (!pos) return

    const point: Point = {
        x: pos.x,
        y: pos.y,
    }

    if (points.value.length === 0) {
        points.value.push(point)
        redraw()
        return
    }

    const last = points.value[points.value.length - 1]

    if (tool.value === 'line') {
        segments.value.push({
            type: 'L',
            start: last,
            end: point,
        })
    } else {
        segments.value.push({
            type: 'A',
            start: last,
            end: point,
            radius: distance(last, point),
            largeArc: 0,
            sweep: 1,
        })
    }

    points.value.push(point)

    redraw()
}

function redraw() {
    if (!layer) return

    layer.destroyChildren()

    drawSegments()

    points.value.forEach((point) => {
        const anchor = new Konva.Circle({
            x: point.x,
            y: point.y,
            radius: 6,
            fill: 'white',
            stroke: 'black',
            strokeWidth: 2,
            draggable: true,
        })

        anchor.on('dragmove', () => {
            point.x = anchor.x()
            point.y = anchor.y()

            redraw()
        })

        layer!.add(anchor)
    })

    layer.draw()
}

function drawSegments() {
    if (!layer) return

    for (const segment of segments.value) {
        if (segment.type === 'L') {
            const line = new Konva.Line({
                points: [segment.start.x, segment.start.y, segment.end.x, segment.end.y],
                stroke: '#2563eb',
                strokeWidth: 2,
            })

            layer.add(line)
        }

        if (segment.type === 'A') {
            const shape = new Konva.Shape({
                stroke: '#dc2626',
                strokeWidth: 2,

                sceneFunc(ctx, shape) {
                    const path = new Path2D(
                        `
            M ${segment.start.x} ${segment.start.y}
            A ${segment.radius}
              ${segment.radius}
              0
              ${segment.largeArc}
              ${segment.sweep}
              ${segment.end.x}
              ${segment.end.y}
          `,
                    )

                    ctx.beginPath()
                    ctx.stroke(path)
                    ctx.fillStrokeShape(shape)
                },
            })

            layer.add(shape)
        }
    }
}

function distance(a: Point, b: Point) {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))
}

function clearAll() {
    points.value = []
    segments.value = []

    redraw()
}

const svgPath = computed(() => {
    if (!points.value.length) {
        return ''
    }

    const first = points.value[0]

    let d = `M ${first.x} ${first.y}`

    for (const segment of segments.value) {
        if (segment.type === 'L') {
            d += ` L ${segment.end.x} ${segment.end.y}`
        }

        if (segment.type === 'A') {
            d += ` A ${segment.radius}
             ${segment.radius}
             0
             ${segment.largeArc}
             ${segment.sweep}
             ${segment.end.x}
             ${segment.end.y}`
        }
    }

    return d
})
</script>
