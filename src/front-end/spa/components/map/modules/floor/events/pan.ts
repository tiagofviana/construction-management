import type { Vector2d } from 'konva/lib/types'
import type { Stage } from 'konva/lib/Stage'
import type { KonvaEventObject, Node } from 'konva/lib/Node'
import type { Point } from '../../types'
import { settings } from '../core'

interface MotionPoints {
    pointer: Point
    stage: Point
}

export class Pan {
    /**
     * Handles stage panning via click-and-drag interactions.
     * Calculates motion relative to the initial touch/click position.
     */

    private motionPoints: MotionPoints | null = null
    private stage: Stage

    constructor(stage: Stage) {
        this.stage = stage
        this.stage.on('mousedown touchstart', (e) => this.onMouseDown(e))
        this.stage.on('mousemove touchmove', () => this.onMouseMove())
        this.stage.on('mouseup touchend', () => this.onMouseUp())
        this.stage.on('mouseleave', () => this.onMouseLeave())
    }

    private onMouseDown(e: KonvaEventObject<MouseEvent>): void {
        const draggableTarget = e.target.findAncestor((node: Node) => node.draggable(), true)
        if (draggableTarget !== undefined) return

        const position = this.stage.getPointerPosition() as Vector2d
        this.motionPoints = {
            pointer: { x: position.x, y: position.y },
            stage: { x: this.stage.x(), y: this.stage.y() },
        }
    }

    private onMouseMove(): void {
        if (this.motionPoints) {
            const now = this.stage.getPointerPosition() as Vector2d
            const rawX = this.motionPoints.stage.x + (now.x - this.motionPoints.pointer.x)
            const rawY = this.motionPoints.stage.y + (now.y - this.motionPoints.pointer.y)
            const boundedPos = this.clampPoint({ x: rawX, y: rawY })
            this.stage.position(boundedPos)
        }
    }

    private onMouseUp(): void {
        this.motionPoints = null
    }

    private onMouseLeave(): void {
        this.motionPoints = null
    }

    public centralize(): void {
        const scale = this.stage.scaleX()
        const scaledWorldW = settings.map.width * scale
        const scaledWorldH = settings.map.height * scale

        this.stage.position({
            x: (this.stage.width() - scaledWorldW) / 2,
            y: (this.stage.height() - scaledWorldH) / 2,
        })
    }

    private clampPoint(point: Point): Point {
        // constrains point (x, y) within allowed maximum and minimum limits
        const scale = this.stage.scaleX()
        const stageWidth = this.stage.width()
        const stageHeight = this.stage.height()

        const scaledWorldW = settings.map.width * scale
        const scaledWorldH = settings.map.height * scale

        const minX = stageWidth - scaledWorldW - settings.map.padding
        const maxX = settings.map.padding
        const minY = stageHeight - scaledWorldH - settings.map.padding
        const maxY = settings.map.padding

        return {
            x: Math.min(Math.max(point.x, minX), maxX),
            y: Math.min(Math.max(point.y, minY), maxY),
        }
    }
}
