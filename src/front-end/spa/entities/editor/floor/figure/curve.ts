import Konva from 'konva'
import type { Layer } from 'konva/lib/Layer'
import type { Line } from 'konva/lib/shapes/Line'
import type { Circle } from 'konva/lib/shapes/Circle'
import { snapValue } from '../utils'
import type { Config, PathCommand, Point } from '../types'

export class CurveControlRenderer {
    private controlLayer: Layer
    public isDragging: boolean = false

    constructor(
        stage: Konva.Stage,
        private config: Config,
    ) {
        this.controlLayer = new Konva.Layer()
        stage.add(this.controlLayer)
    }

    public draw(
        path: Array<PathCommand>,
        onDrag: (value: Array<PathCommand>) => void = () => {},
    ): void {
        this.controlLayer.destroyChildren()

        path.forEach((item, index) => {
            if (item.cmd !== 'C') return

            const previous = path[index - 1]
            if (!previous) return

            // First control point
            this.addControl(
                { x: previous.x, y: previous.y },
                { x: item.x1, y: item.y1 },
                (value) => {
                    item.x1 = value.x
                    item.y1 = value.y
                    onDrag(path)
                },
            )

            // Second control point
            this.addControl({ x: item.x, y: item.y }, { x: item.x2, y: item.y2 }, (value) => {
                item.x2 = value.x
                item.y2 = value.y
                onDrag(path)
            })
        })
        this.controlLayer.batchDraw()
    }

    public clear(): void {
        this.controlLayer.destroyChildren()
    }

    public destroy(): void {
        this.controlLayer.destroy()
    }

    private addControl(
        linePosition: Point,
        circlePosition: Point,
        onDrag: (value: Point) => void,
    ): void {
        const line = this.createControlLine(linePosition, circlePosition)
        const circle = this.createControlCircle(circlePosition)

        circle.on('dragstart', () => {
            this.isDragging = true
        })

        circle.on('dragend', () => {
            this.isDragging = false
        })

        circle.on('dragmove', () => {
            const point = this.validateAndSnapPoint({
                x: Math.round(circle.x()),
                y: Math.round(circle.y()),
            })

            circle.position(point)
            line.points([linePosition.x, linePosition.y, point.x, point.y])
            this.controlLayer.batchDraw()
        })

        circle.on('dragmove', () => {
            const point = this.validateAndSnapPoint({
                x: circle.x(),
                y: circle.y(),
            })
            onDrag(point)
        })

        this.controlLayer.add(line)
        this.controlLayer.add(circle)
    }

    private createControlLine(from: Point, to: Point): Line {
        return new Konva.Line({
            points: [from.x, from.y, to.x, to.y],
            stroke: '#666',
            strokeWidth: 1,
            listening: false,
        })
    }

    private createControlCircle(point: Point): Circle {
        return new Konva.Circle({
            x: point.x,
            y: point.y,
            radius: 4.5,
            fill: '#22c55e',
            stroke: '#000',
            strokeWidth: 0.5,
            draggable: true,
        })
    }

    private validateAndSnapPoint(point: Point): Point {
        if (this.config.isSnapOn) {
            point.x = snapValue(point.x, this.config.snapLength)
            point.y = snapValue(point.y, this.config.snapLength)
        }

        point.x = Math.max(0, Math.min(this.config.width, point.x))
        point.y = Math.max(0, Math.min(this.config.height, point.y))

        return point
    }
}
