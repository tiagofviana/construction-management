import type { Stage } from 'konva/lib/Stage'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { Point } from '../../types'

export class MouseTracker {
    private stage: Stage
    public onTrackChange: (point: Point) => void
    public onDragChange: (point: Point) => void

    constructor(stage: Stage) {
        this.stage = stage
        this.onTrackChange = () => {}
        this.onDragChange = () => {}

        this.stage.on('mousemove touchmove', () => this.onMouseMove())
        this.stage.on('dragmove', (e) => this.onDragMove(e))
    }

    private onMouseMove(): void {
        const ptr = this.stage.getPointerPosition() as Point
        const scale = this.stage.scaleX()

        const point = {
            x: Math.round((ptr.x - this.stage.x()) / scale),
            y: Math.round((ptr.y - this.stage.y()) / scale),
        }

        this.onTrackChange(point)
    }

    private onDragMove(e: KonvaEventObject<MouseEvent>): void {
        this.onDragChange(e.target.getPosition())
    }
}
