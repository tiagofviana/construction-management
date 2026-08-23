import type { Vector2d } from 'konva/lib/types'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { Stage } from 'konva/lib/Stage'
import { settings } from '../core'

export class Zoom {
    private stage: Stage
    public onZoomChange: (value: number) => void

    constructor(stage: Stage) {
        this.stage = stage
        this.onZoomChange = () => {}

        this.stage.on('wheel', (e) => {
            this.onWheel(e)
            this.onZoomChange(this.getZoom())
        })
    }

    private onWheel(e: KonvaEventObject<WheelEvent>): void {
        e.evt.preventDefault()

        const ptr = this.stage.getPointerPosition() as Vector2d
        const oldScale = this.stage.scaleX()
        const direction = e.evt.deltaY > 0 ? -1 : 1
        const factor = 1 + direction * settings.zoom.speed
        const newScale = Math.min(Math.max(oldScale * factor, settings.zoom.min), settings.zoom.max)
        const scaleRatio = newScale / oldScale
        const targetPos = {
            x: ptr.x - (ptr.x - this.stage.x()) * scaleRatio,
            y: ptr.y - (ptr.y - this.stage.y()) * scaleRatio,
        }

        this.stage.setAttrs({
            scaleX: newScale,
            scaleY: newScale,
            x: targetPos.x,
            y: targetPos.y,
        })

        this.onZoomChange(newScale)
    }

    public getZoom(): number {
        return this.stage.scaleX()
    }

    public reset(): void {
        this.stage.scale({ x: 1, y: 1 })
        this.onZoomChange(this.stage.scaleX())
    }

    public apply(zoom: number): void {
        const current = this.stage.scaleX()
        const newScale = Math.min(Math.max(current + zoom, settings.zoom.min), settings.zoom.max)
        const cx = this.stage.width() / 2
        const cy = this.stage.height() / 2
        const ratio = newScale / this.stage.scaleX()
        this.stage.scale({ x: newScale, y: newScale })
        this.stage.position({
            x: cx - (cx - this.stage.x()) * ratio,
            y: cy - (cy - this.stage.y()) * ratio,
        })

        this.onZoomChange(newScale)
    }
}
