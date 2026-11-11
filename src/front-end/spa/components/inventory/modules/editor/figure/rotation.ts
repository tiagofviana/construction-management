import Konva from 'konva'
import type { IPoint } from '../../viewer/types'

const LINE_SIZE = 30

/**
 * Draws a handle around the selected item, dragging the circle rotates the item around its center.
 */
export class RotationHandler {
    private group = new Konva.Group({ name: 'rotation-handler' })
    private centerPoint: IPoint = { x: 0, y: 0 }
    private radius = 0
    private line?: Konva.Line
    private initialAngle = 0
    private lastSnappedAngle = 0
    private initialNodeRotation = 0
    private node: Konva.Image | null = null
    public onRotationEnd: (itemId: string, rotation: number) => void = () => {}

    constructor(layer: Konva.Layer) {
        layer.add(this.group)
    }

    public clear() {
        this.group.destroyChildren()
        this.line = undefined
        this.node = null
    }

    public moveToTop() {
        this.group.moveToTop()
    }

    public isDrawnFor(node: Konva.Image): boolean {
        return this.node === node
    }

    public draw(node: Konva.Image) {
        this.clear()
        this.node = node

        // The item offset is its center, so its position is the rotation center
        this.centerPoint = node.position()
        this.radius = Math.max(node.width(), node.height()) / 2 + LINE_SIZE

        const radians = this.normalizeAngle(node.rotation() - 90) * (Math.PI / 180)
        const handlePoint = {
            x: this.centerPoint.x + Math.cos(radians) * this.radius,
            y: this.centerPoint.y + Math.sin(radians) * this.radius,
        }

        this.line = this.createLine(this.centerPoint, handlePoint)
        const circle = this.createCircle(handlePoint)
        this.setCircleEvents(circle, node)

        this.group.add(this.line, circle)
        this.moveToTop()
    }

    private createLine(start: IPoint, end: IPoint): Konva.Line {
        return new Konva.Line({
            points: [start.x, start.y, end.x, end.y],
            dash: [6, 4],
            stroke: 'rgba(0,0,0,.5)',
            strokeWidth: 1.5,
            strokeScaleEnabled: false,
            listening: false,
        })
    }

    private createCircle(point: IPoint): Konva.Circle {
        return new Konva.Circle({
            x: point.x,
            y: point.y,
            radius: 6,
            fill: '#f97316',
            stroke: 'rgba(0,0,0,.2)',
            strokeWidth: 0.6,
            hitStrokeWidth: 8,
            shadowColor: '#000',
            shadowBlur: 4,
            shadowOffset: { x: 1, y: 1 },
            shadowOpacity: 0.6,
            draggable: true,
        })
    }

    private setCircleEvents(circle: Konva.Circle, node: Konva.Image) {
        const container = this.group.getStage()?.container() as HTMLDivElement

        circle.on('mouseover', () => {
            container.style.cursor = 'all-scroll'
        })

        circle.on('mouseout', () => {
            container.style.removeProperty('cursor')
        })

        circle.on('dragstart', () => {
            this.initialAngle = Math.round(this.getAngle(circle)) % 360
            this.lastSnappedAngle = this.initialAngle
            this.initialNodeRotation = node.rotation()
        })

        circle.on('dragmove', () => {
            const snappedAngle = Math.round(this.getAngle(circle)) % 360

            this.updateCirclePosition(circle, snappedAngle)
            this.line?.points([this.centerPoint.x, this.centerPoint.y, circle.x(), circle.y()])

            if (snappedAngle === this.lastSnappedAngle) return
            this.lastSnappedAngle = snappedAngle

            const rotationDelta = this.normalizeAngle(snappedAngle - this.initialAngle)
            node.rotation(this.normalizeAngle(this.initialNodeRotation + rotationDelta))
        })

        circle.on('dragend', () => {
            this.onRotationEnd(node.name(), node.rotation())
        })
    }

    private getAngle(circle: Konva.Circle): number {
        const dx = circle.x() - this.centerPoint.x
        const dy = circle.y() - this.centerPoint.y
        return this.normalizeAngle(Math.atan2(dy, dx) * (180 / Math.PI))
    }

    // Keeps the angle between 0 and 360
    private normalizeAngle(angle: number): number {
        return ((angle % 360) + 360) % 360
    }

    private updateCirclePosition(circle: Konva.Circle, angle: number) {
        const radians = angle * (Math.PI / 180)

        circle.position({
            x: this.centerPoint.x + Math.cos(radians) * this.radius,
            y: this.centerPoint.y + Math.sin(radians) * this.radius,
        })
    }
}
