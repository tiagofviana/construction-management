import Konva from 'konva'
import type { Stage } from 'konva/lib/Stage'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { Settings } from '../core/settings'
import type { IPoint } from '../../viewer/types'

/**
 * Tracks the pointer position in room coordinates (the room view box origin is 0, 0).
 */
export class MouseTracker {
    private stage: Stage
    private settings: Settings
    public onTrackChange: (point: IPoint) => void = () => {}
    public onDragChange: (point: IPoint) => void = () => {}

    constructor(stage: Stage, settings: Settings) {
        this.stage = stage
        this.settings = settings

        this.stage.on('mousemove touchmove', () => this.onMouseMove())
        this.stage.on('dragmove', (e) => this.onDragMove(e))
    }

    private onMouseMove(): void {
        const ptr = this.stage.getPointerPosition()
        if (!ptr) return

        const scale = this.stage.scaleX()
        const padding = this.settings.map.padding

        this.onTrackChange({
            x: Math.round((ptr.x - this.stage.x()) / scale - padding),
            y: Math.round((ptr.y - this.stage.y()) / scale - padding),
        })
    }

    // Only the items are tracked, the rotation handler circle is ignored
    private onDragMove(e: KonvaEventObject<DragEvent>): void {
        const node = e.target
        if (!(node instanceof Konva.Image)) return

        const padding = this.settings.map.padding

        // The item node is already constrained (snap and room limits) at this point
        this.onDragChange({
            x: Math.round(node.x() - node.offsetX() - padding),
            y: Math.round(node.y() - node.offsetY() - padding),
        })
    }
}
