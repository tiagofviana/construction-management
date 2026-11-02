import type { Vector2d } from 'konva/lib/types'
import type { Stage } from 'konva/lib/Stage'
import type { Settings } from '../core/settings'
import type { Point, Size } from '../types'

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
    private settings: Settings
    private getMapSize: () => Size

    constructor(stage: Stage, settings: Settings, getMapSize: () => Size) {
        this.stage = stage
        this.settings = settings
        this.getMapSize = getMapSize
        this.stage.on('mousedown touchstart', () => this.onMouseDown())
        this.stage.on('mousemove touchmove', () => this.onMouseMove())
        this.stage.on('mouseup touchend mouseleave', () => (this.motionPoints = null))
    }

    private onMouseDown(): void {
        const position = this.stage.getPointerPosition() as Vector2d
        this.motionPoints = {
            pointer: { x: position.x, y: position.y },
            stage: { x: this.stage.x(), y: this.stage.y() },
        }
    }

    private onMouseMove(): void {
        if (!this.motionPoints) return

        const now = this.stage.getPointerPosition() as Vector2d
        const rawX = this.motionPoints.stage.x + (now.x - this.motionPoints.pointer.x)
        const rawY = this.motionPoints.stage.y + (now.y - this.motionPoints.pointer.y)
        this.stage.position(this.clampPoint({ x: rawX, y: rawY }))
    }

    public centralize(): void {
        const scale = this.stage.scaleX()
        const { width, height } = this.getMapSize()

        this.stage.position({
            x: (this.stage.width() - width * scale) / 2,
            y: (this.stage.height() - height * scale) / 2,
        })
    }

    // Keeps the current position inside the limits, used after the scale changes
    public clamp(): void {
        this.stage.position(this.clampPoint(this.stage.position()))
    }

    private clampPoint(point: Point): Point {
        // constrains point (x, y) within allowed maximum and minimum limits
        const scale = this.stage.scaleX()
        const { width, height } = this.getMapSize()
        const padding = this.settings.map.padding * scale

        return {
            x: this.clampAxis(point.x, this.stage.width(), width * scale, padding),
            y: this.clampAxis(point.y, this.stage.height(), height * scale, padding),
        }
    }

    /**
     * A map bigger than the stage moves until its edges reach the stage edges,
     * a smaller one moves freely inside the stage. Both can go "padding" beyond the limits.
     */
    private clampAxis(value: number, stageLength: number, mapLength: number, padding: number) {
        const space = stageLength - mapLength
        const min = Math.min(space, 0) - padding
        const max = Math.max(space, 0) + padding

        return Math.min(Math.max(value, min), max)
    }
}
