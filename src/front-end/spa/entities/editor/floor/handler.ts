import type { Vector2d } from 'konva/lib/types'
import type { Stage } from 'konva/lib/Stage'
import type { Point, ToolOptions } from './types'
import { ZoomController } from './controllers/zoom'
import { PanController } from './controllers/pan'
import { DrawingToolManager } from './manager/drawingTool'

export class InputHandler {
    constructor(
        private stage: Stage,
        private zoomController: ZoomController,
        private panController: PanController,
        private drawingToolManager: DrawingToolManager,
        private onMouseTrack: (point: Point) => void,
        private onStageDown: (tool: ToolOptions) => void,
    ) {}

    public bindStageEvents(): void {
        this.stage.on('wheel', (e) => this.zoomController.onWheel(e))
        this.stage.on('mousedown touchstart', () => this.handleStageDown())
        this.stage.on('mouseup touchend', () => this.handleStageUp())
        this.stage.on('mousemove touchmove', () => this.handleStageMove())
        this.stage.on('mousemove', () => this.handleMouseTrack())
    }

    private handleStageDown(): void {
        if (this.drawingToolManager.isToolActive(null)) {
            this.panController.onStageDown()
        } else {
            this.onStageDown(this.drawingToolManager.getTool())
        }
    }

    private handleStageUp(): void {
        if (this.drawingToolManager.isToolActive(null)) {
            this.panController.onStageUp()
        }
    }

    private handleStageMove(): void {
        if (this.drawingToolManager.isToolActive(null)) {
            this.panController.onStageMove()
        }
    }

    private handleMouseTrack(): void {
        const ptr = this.stage.getPointerPosition() as Vector2d
        const scale = this.stage.scaleX()

        const point: Point = {
            x: Math.round((ptr.x - this.stage.x()) / scale),
            y: Math.round((ptr.y - this.stage.y()) / scale),
        }

        this.drawingToolManager.setMousePoint(point)
        this.onMouseTrack(point)
    }

    public onPointerOut(): void {
        if (this.drawingToolManager.isToolActive(null)) {
            this.panController.onPointerOut()
        }
    }
}
