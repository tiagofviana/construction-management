import type { Vector2d } from 'konva/lib/types'
import type { Stage } from 'konva/lib/Stage'
import type { IPoint } from '../../types'
import { settings } from '../core'

interface IMotionPoints {
    pointer: IPoint
    stage: IPoint
}

export class Pan {
    /**
     * Handles stage panning via click-and-drag interactions.
     * Calculates motion relative to the initial touch/click position.
     */

    private motionPoints: IMotionPoints | null = null
    private stage: Stage

    constructor(stage: Stage) {
        this.stage = stage
        this.stage.on('mousedown touchstart', () => this.onMouseDown())
        this.stage.on('mousemove touchmove', () => this.onMouseMove())
        this.stage.on('mouseup touchend', () => this.onMouseUp())
        this.stage.on('mouseleave', () => this.onMouseLeave())
    }

    private onMouseDown(): void {
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

    // Keeps the current position inside the limits, used after the scale changes
    public clamp(): void {
        this.stage.position(this.clampPoint(this.stage.position()))
    }

    private clampPoint(point: IPoint): IPoint {
        // constrains point (x, y) within allowed maximum and minimum limits
        const scale = this.stage.scaleX()
        const scaledWorldW = settings.map.width * scale
        const scaledWorldH = settings.map.height * scale

        return {
            x: this.clampAxis(point.x, this.stage.width(), scaledWorldW),
            y: this.clampAxis(point.y, this.stage.height(), scaledWorldH),
        }
    }

    /**
     * A map bigger than the stage moves until its edges reach the stage edges,
     * a smaller one moves freely inside the stage. Both can go "padding" beyond the limits.
     */
    private clampAxis(value: number, stageLength: number, mapLength: number): number {
        const space = stageLength - mapLength
        const min = Math.min(space, 0) - settings.map.padding
        const max = Math.max(space, 0) + settings.map.padding

        return Math.min(Math.max(value, min), max)
    }
}
