import type { Vector2d } from 'konva/lib/types'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { Stage } from 'konva/lib/Stage'
import type { Settings } from '../core/settings'

export class Zoom {
    private stage: Stage
    private settings: Settings
    public onZoomChange: (value: number) => void

    constructor(stage: Stage, settings: Settings) {
        this.stage = stage
        this.settings = settings
        this.onZoomChange = () => {}

        this.stage.on('wheel', (e) => this.onWheel(e))
    }

    private onWheel(e: KonvaEventObject<WheelEvent>): void {
        e.evt.preventDefault()

        const ptr = this.stage.getPointerPosition() as Vector2d
        const direction = e.evt.deltaY > 0 ? -1 : 1
        const factor = 1 + direction * this.settings.zoom.speed

        this.scaleAt(ptr, this.getZoom() * factor)
    }

    public getZoom(): number {
        return this.stage.scaleX()
    }

    public reset(): void {
        this.stage.scale({ x: 1, y: 1 })
        this.onZoomChange(this.getZoom())
    }

    public apply(zoom: number): void {
        const center = {
            x: this.stage.width() / 2,
            y: this.stage.height() / 2,
        }

        this.scaleAt(center, this.getZoom() + zoom)
    }

    // Scales the stage keeping the given screen point fixed
    private scaleAt(origin: Vector2d, scale: number): void {
        const newScale = this.clamp(scale)
        const ratio = newScale / this.getZoom()

        this.stage.setAttrs({
            scaleX: newScale,
            scaleY: newScale,
            x: origin.x - (origin.x - this.stage.x()) * ratio,
            y: origin.y - (origin.y - this.stage.y()) * ratio,
        })

        this.onZoomChange(newScale)
    }

    private clamp(scale: number): number {
        return Math.min(Math.max(scale, this.settings.zoom.min), this.settings.zoom.max)
    }
}
