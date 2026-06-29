import Konva from 'konva'
import type { Layer } from 'konva/lib/Layer'
import type { Circle } from 'konva/lib/shapes/Circle'
import { snapValue } from '../utils'
import type { Config, PathCommand, Point } from '../types'

export class VertexRenderer {
    private vertexLayer: Layer

    constructor(
        stage: Konva.Stage,
        private config: Config,
    ) {
        this.vertexLayer = new Konva.Layer()
        stage.add(this.vertexLayer)
    }

    public draw(
        path: Array<PathCommand>,
        isDraggable: boolean,
        onDrag: (value: Array<PathCommand>) => void = () => {},
    ): void {
        this.vertexLayer.destroyChildren()

        path.forEach((item) => {
            const circle = this.createVerticeCircle({ x: item.x, y: item.y }, isDraggable)

            if (isDraggable) {
                circle.on('dragmove', () => {
                    Math.round(circle.x())
                    const point = this.validateAndSnapPoint({
                        x: Math.round(circle.x()),
                        y: Math.round(circle.y()),
                    })

                    circle.setPosition(point)
                    item.x = point.x
                    item.y = point.y
                    onDrag(path)
                })
            }

            this.vertexLayer.add(circle)
        })

        this.vertexLayer.batchDraw()
    }

    public clear(): void {
        this.vertexLayer.destroyChildren()
    }

    public destroy(): void {
        this.vertexLayer.destroy()
    }

    private createVerticeCircle(point: Point, isDraggable: boolean): Circle {
        return new Konva.Circle({
            x: point.x,
            y: point.y,
            radius: 5,
            fill: '#faa032',
            stroke: 'rgba(0,0,0,.2)',
            strokeWidth: 0.6,
            hitStrokeWidth: 8,
            shadowColor: '#000',
            shadowBlur: 4,
            shadowOffset: { x: 1, y: 1 },
            shadowOpacity: 0.6,
            draggable: isDraggable,
            miterLimit: 900,
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
