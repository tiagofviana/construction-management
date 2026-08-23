import type { Stage } from 'konva/lib/Stage'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { Point } from '../../types'
import { svgPath, tool } from '../core'
import type { DrawManager } from '../figure'

export class MouseTracker {
    private stage: Stage
    public onTrackChange: (point: Point) => void
    public onDragChange: (point: Point) => void
    private drawManager: DrawManager

    constructor(stage: Stage, drawManager: DrawManager) {
        this.stage = stage
        this.drawManager = drawManager
        this.onTrackChange = () => {}
        this.onDragChange = () => {}

        this.stage.on('click tap', () => this.onClickTap())
        this.stage.on('mousemove touchmove', () => this.onMouseMove())
        this.stage.on('dragmove', (e) => this.onDragMove(e))
    }

    private getCurrentMousePoint(): Point {
        const ptr = this.stage.getPointerPosition() as Point
        const scale = this.stage.scaleX()

        const point = {
            x: Math.round((ptr.x - this.stage.x()) / scale),
            y: Math.round((ptr.y - this.stage.y()) / scale),
        }

        return point
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

    private onClickTap() {
        const point = this.getCurrentMousePoint()

        if (tool.selected === 'line') {
            svgPath.addLineCommand(point)
            this.drawManager.room.draw()
            this.drawManager.info.draw()
        } else if (tool.selected === 'curve') {
            svgPath.addCurveCommand(point)
            this.drawManager.room.draw()
            this.drawManager.info.draw()
        }
    }
}
