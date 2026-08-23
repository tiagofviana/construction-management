import Konva from 'konva'
import type { Layer } from 'konva/lib/Layer'
import { rooms } from '../../core'
import type { Point } from '../../../types'
import type { Shape } from './shape'

const LINE_SIZE = 60

export class RotationHandler {
    private group = new Konva.Group({
        name: 'rotation-handler',
        draggable: true,
    })

    private centerPoint: Point = {
        x: 0,
        y: 0,
    }

    private radius = 0
    private line?: Konva.Line
    private initialAngle = 0
    private lastSnappedAngle = 0
    private initialShapeRotation = 0

    constructor(layer: Layer) {
        layer.add(this.group)
    }

    public clear() {
        this.group.destroyChildren()
        this.line = undefined
    }

    public moveToTop() {
        this.group.moveToTop()
    }

    public draw(shape: Shape) {
        this.group.destroyChildren()
        const rotation = shape.getRotation()

        const dimensions = shape.getDimentions()

        this.centerPoint = {
            x: dimensions.x + dimensions.width / 2,
            y: dimensions.y + dimensions.height / 2,
        }

        this.radius = dimensions.height / 2 + LINE_SIZE

        const angle = this.normalizeAngle(rotation - 90)
        const radians = angle * (Math.PI / 180)

        const handlePoint = {
            x: this.centerPoint.x + Math.cos(radians) * this.radius,
            y: this.centerPoint.y + Math.sin(radians) * this.radius,
        }

        this.line = this.createLine(this.centerPoint, handlePoint)

        const circle = this.createCircle(handlePoint, shape.getColor())
        this.setCircleEvents(circle, shape)

        this.group.add(this.line, circle)
    }

    private createLine(start: Point, end: Point): Konva.Line {
        return new Konva.Line({
            points: [start.x, start.y, end.x, end.y],
            dash: [10, 5],
            stroke: 'rgba(0,0,0,.5)',
            strokeWidth: 1.5,
            listening: false,
        })
    }

    private createCircle(point: Point, color: string): Konva.Circle {
        return new Konva.Circle({
            x: point.x,
            y: point.y,
            radius: 8,
            fill: color,
            stroke: 'rgba(0,0,0,.2)',
            strokeWidth: 0.6,
            hitStrokeWidth: 8,
            shadowColor: '#000',
            shadowBlur: 4,
            shadowOffset: {
                x: 1,
                y: 1,
            },
            shadowOpacity: 0.6,
            draggable: true,
        })
    }

    public setCircleEvents(circle: Konva.Circle, shape: Shape) {
        const container = this.group.getStage()?.container() as HTMLDivElement

        circle.on('dragstart', () => {
            this.initialAngle = Math.round(this.getAngle(circle)) % 360
            this.lastSnappedAngle = this.initialAngle
            this.initialShapeRotation = shape.getRotation()
        })

        circle.on('mouseover', () => {
            if (container.style.cursor !== 'all-scroll') {
                container.style.cursor = 'all-scroll'
            }
        })

        circle.on('mouseout', () => {
            container.style.removeProperty('cursor')
        })

        circle.on('dragmove', () => {
            const rawAngle = this.getAngle(circle)
            const snappedAngle = Math.round(rawAngle) % 360

            this.updateCirclePosition(circle, snappedAngle)
            this.updateLine(circle)

            if (snappedAngle === this.lastSnappedAngle) {
                return
            }
            this.lastSnappedAngle = snappedAngle

            const rotationDelta = Math.round(this.normalizeAngle(snappedAngle - this.initialAngle))

            const newRotation = this.normalizeAngle(this.initialShapeRotation + rotationDelta)
            shape.setRotation(newRotation)
        })

        circle.on('dragend', () => {
            rooms.updateRoomRotation(shape.getRoomId(), shape.getRotation())
        })
    }

    private getAngle(circle: Konva.Circle): number {
        const dx = circle.x() - this.centerPoint.x
        const dy = circle.y() - this.centerPoint.y
        const radians = Math.atan2(dy, dx)
        const degrees = radians * (180 / Math.PI)

        return this.normalizeAngle(degrees)
    }

    private normalizeAngle(angle: number): number {
        return ((angle % 360) + 360) % 360
    }

    private updateCirclePosition(circle: Konva.Circle, angle: number) {
        const radians = angle * (Math.PI / 180)
        const point = {
            x: Math.round(this.centerPoint.x + Math.cos(radians) * this.radius),
            y: Math.round(this.centerPoint.y + Math.sin(radians) * this.radius),
        }

        circle.position(point)
    }

    updateLine(circle: Konva.Circle) {
        this.line?.points([this.centerPoint.x, this.centerPoint.y, circle.x(), circle.y()])
    }
}
