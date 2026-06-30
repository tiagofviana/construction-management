import type { Vector2d } from 'konva/lib/types'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { Stage } from 'konva/lib/Stage'
import type { Point, Config } from '../types'

const ZOOM_SPEED = 0.1
const MIN_ZOOM = 0.25
const MAX_ZOOM = 10

export class ZoomController {
    constructor(
        private stage: Stage,
        private config: Config,
    ) {}

    public onWheel = (
        e: KonvaEventObject<WheelEvent>,
        onZoomChange?: (value: number) => void,
    ): void => {
        e.evt.preventDefault()

        const ptr = this.stage.getPointerPosition() as Vector2d
        const oldScale = this.stage.scaleX()
        const direction = e.evt.deltaY > 0 ? -1 : 1
        const factor = 1 + direction * ZOOM_SPEED
        const newScale = Math.min(Math.max(oldScale * factor, MIN_ZOOM), MAX_ZOOM)
        const scaleRatio = newScale / oldScale
        const targetPos = {
            x: ptr.x - (ptr.x - this.stage.x()) * scaleRatio,
            y: ptr.y - (ptr.y - this.stage.y()) * scaleRatio,
        }
        const boundedPos = this.clampPosition(targetPos.x, targetPos.y, newScale)

        this.stage.setAttrs({
            scaleX: newScale,
            scaleY: newScale,
            x: boundedPos.x,
            y: boundedPos.y,
        })

        if (onZoomChange) {
            onZoomChange(newScale)
        }
    }

    public resetZoom(): void {
        this.stage.scale({ x: 1, y: 1 })
        this.stage.position({ x: 0, y: 0 })
        this.centralize()
    }

    public getScale(): number {
        return this.stage.scale().x
    }

    public applyZoom(zoom: number): void {
        const current = this.stage.scaleX()
        const newScale = Math.min(Math.max(current + zoom, MIN_ZOOM), MAX_ZOOM)
        const cx = this.stage.width() / 2
        const cy = this.stage.height() / 2
        const ratio = newScale / this.stage.scaleX()
        this.stage.scale({ x: newScale, y: newScale })
        this.stage.position({
            x: cx - (cx - this.stage.x()) * ratio,
            y: cy - (cy - this.stage.y()) * ratio,
        })
    }

    public centralize = (): void => {
        const scale = this.stage.scaleX()
        const scaledWorldW = this.config.width * scale
        const scaledWorldH = this.config.height * scale

        this.stage.position({
            x: (this.stage.width() - scaledWorldW) / 2,
            y: (this.stage.height() - scaledWorldH) / 2,
        })
    }

    public clampPosition = (x: number, y: number, scale: number): Point => {
        const stageWidth = this.stage.width()
        const stageHeight = this.stage.height()

        const scaledWorldW = this.config.width * scale
        const scaledWorldH = this.config.height * scale

        const minX = -(scaledWorldW - this.config.padding)
        const maxX = stageWidth - this.config.padding
        const minY = -(scaledWorldH - this.config.padding)
        const maxY = stageHeight - this.config.padding

        return {
            x: Math.min(Math.max(x, minX), maxX),
            y: Math.min(Math.max(y, minY), maxY),
        }
    }
}
