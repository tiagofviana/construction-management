import type { Vector2d } from 'konva/lib/types'
import type { Stage } from 'konva/lib/Stage'
import type { Point } from '../types'
import type { Settings } from '../core/settings'

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

    constructor(stage: Stage, settings: Settings) {
        this.stage = stage
        this.settings = settings

        this.stage.on('mousedown touchstart', () => this.onMouseDown())
        this.stage.on('mousemove touchmove', () => this.onMouseMove())
        this.stage.on('mouseup touchend mouseleave', () => this.onMouseUp())
    }

    private onMouseDown(): void {
        const position = this.stage.getPointerPosition() as Vector2d
        this.motionPoints = {
            pointer: { x: position.x, y: position.y },
            stage: { x: this.stage.x(), y: this.stage.y() },
        }
        this.setCursor('grabbing')
    }

    private onMouseMove(): void {
        if (!this.motionPoints) return

        const now = this.stage.getPointerPosition() as Vector2d
        const rawX = this.motionPoints.stage.x + (now.x - this.motionPoints.pointer.x)
        const rawY = this.motionPoints.stage.y + (now.y - this.motionPoints.pointer.y)
        this.stage.position(this.clampPoint({ x: rawX, y: rawY }))
    }

    private onMouseUp(): void {
        this.motionPoints = null
        this.setCursor('grab')
    }

    public centralize(): void {
        const scale = this.stage.scaleX()
        const map = this.settings.map

        this.stage.position({
            x: (this.stage.width() - map.width * scale) / 2,
            y: (this.stage.height() - map.height * scale) / 2,
        })
    }

    private setCursor(cursor: 'grab' | 'grabbing'): void {
        this.stage.container().style.cursor = cursor
    }

    private clampPoint(point: Point): Point {
        // constrains point (x, y) within allowed maximum and minimum limits
        const scale = this.stage.scaleX()
        const map = this.settings.map
        const padding = map.padding

        return {
            x: clamp(point.x, this.stage.width() - map.width * scale - padding, padding),
            y: clamp(point.y, this.stage.height() - map.height * scale - padding, padding),
        }
    }
}

// The limits may be inverted when the room is smaller than the stage
function clamp(value: number, limitA: number, limitB: number): number {
    const min = Math.min(limitA, limitB)
    const max = Math.max(limitA, limitB)
    return Math.min(Math.max(value, min), max)
}
