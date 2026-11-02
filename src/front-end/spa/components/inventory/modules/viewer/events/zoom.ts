import type { Vector2d } from 'konva/lib/types'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { Stage } from 'konva/lib/Stage'
import type { Settings } from '../core/settings'
import type { Size } from '../types'

export class Zoom {
    private stage: Stage
    private settings: Settings
    private getMapSize: () => Size
    public onZoom: () => void = () => {}

    constructor(stage: Stage, settings: Settings, getMapSize: () => Size) {
        this.stage = stage
        this.settings = settings
        this.getMapSize = getMapSize
        this.stage.on('wheel', (e) => this.onWheel(e))
    }

    private onWheel(e: KonvaEventObject<WheelEvent>): void {
        e.evt.preventDefault()

        const { speed, min, max } = this.settings.zoom
        const ptr = this.stage.getPointerPosition() as Vector2d
        const oldScale = this.stage.scaleX()
        const direction = e.evt.deltaY > 0 ? -1 : 1
        const newScale = Math.min(Math.max(oldScale * (1 + direction * speed), min), max)
        const scaleRatio = newScale / oldScale

        this.stage.setAttrs({
            scaleX: newScale,
            scaleY: newScale,
            x: ptr.x - (ptr.x - this.stage.x()) * scaleRatio,
            y: ptr.y - (ptr.y - this.stage.y()) * scaleRatio,
        })
        this.onZoom()
    }

    // Scales the stage so the whole map fits inside it
    public fit(): void {
        const { width, height } = this.getMapSize()
        if (width === 0 || height === 0) return

        const scale = Math.min(this.stage.width() / width, this.stage.height() / height)
        const { min, max } = this.settings.zoom

        this.stage.scale({
            x: Math.min(Math.max(scale, min), max),
            y: Math.min(Math.max(scale, min), max),
        })
    }
}
