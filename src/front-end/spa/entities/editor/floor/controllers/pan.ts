import type { Vector2d } from 'konva/lib/types'
import type { Stage } from 'konva/lib/Stage'
import type { MotionPoints } from '../types'
import { ZoomController } from './zoom'

export class PanController {
    private motionPoints: null | MotionPoints = null

    constructor(
        private stage: Stage,
        private zoomController: ZoomController,
    ) {}

    public onStageDown = (): void => {
        const position = this.stage.getPointerPosition() as Vector2d
        this.motionPoints = {
            pointer: { x: position.x, y: position.y },
            stage: { x: this.stage.x(), y: this.stage.y() },
        }
    }

    public onStageMove = (): void => {
        if (this.motionPoints) {
            const now = this.stage.getPointerPosition() as Vector2d
            const rawX = this.motionPoints.stage.x + (now.x - this.motionPoints.pointer.x)
            const rawY = this.motionPoints.stage.y + (now.y - this.motionPoints.pointer.y)
            const boundedPos = this.zoomController.clampPosition(rawX, rawY, this.stage.scaleX())
            this.stage.position(boundedPos)
        }
    }

    public onStageUp = (): void => {
        this.motionPoints = null
    }

    public onPointerOut = (): void => {
        this.motionPoints = null
    }

    public isActive = (): boolean => {
        return this.motionPoints !== null
    }
}
