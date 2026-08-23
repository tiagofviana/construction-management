import Konva from 'konva'
import type { Line } from 'konva/lib/shapes/Line'
import type { Circle } from 'konva/lib/shapes/Circle'
import { snapValue } from '../../../utils'
import type { Point } from '../../../types'
import { Figure } from '../figure'
import { svgPath, settings } from '../../core'
import { PathCommand, CurveCmd } from '../../../types'

export class CurveControllers extends Figure {
    public onControllerChange: () => void = () => {}

    public draw(): void {
        this.group.destroyChildren()
        this.group.listening(true)

        const path = svgPath.getPath()

        path.forEach((item, index) => {
            if (item.cmd !== 'C') return

            const previous = path[index - 1]
            if (!previous) return

            this.addFirstControl(previous, item)
            this.addSecondControl(item)
        })
    }

    public clear(): void {
        this.group.destroyChildren()
        this.group.listening(false)
    }

    private addFirstControl(previous: PathCommand, current: CurveCmd): void {
        const linePoint = { x: previous.x, y: previous.y }
        const endPoint = { x: current.x1, y: current.y1 }

        const line = this.createControlLine(linePoint, endPoint)
        const circle = this.createControlCircle(endPoint)

        circle.on('dragmove', () => {
            const point = this.snapPoint({
                x: Math.round(circle.x()),
                y: Math.round(circle.y()),
            })

            circle.position(point)
            line.points([linePoint.x, linePoint.y, point.x, point.y])

            current.x1 = point.x
            current.y1 = point.y

            this.onControllerChange()
        })

        circle.on('dragend', () => {
            const path = svgPath.getPath()
            svgPath.onPathChange(path)
        })

        this.group.add(line, circle)
    }

    private addSecondControl(current: CurveCmd): void {
        const linePoint = { x: current.x, y: current.y }
        const endPoint = { x: current.x2, y: current.y2 }

        const line = this.createControlLine(linePoint, endPoint)
        const circle = this.createControlCircle(endPoint)

        circle.on('dragmove', () => {
            const point = this.snapPoint({
                x: Math.round(circle.x()),
                y: Math.round(circle.y()),
            })

            circle.position(point)
            line.points([linePoint.x, linePoint.y, point.x, point.y])

            current.x2 = point.x
            current.y2 = point.y

            this.onControllerChange()
        })

        this.group.add(line, circle)
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
            radius: 6,
            fill: '#22c55e',
            stroke: '#000',
            strokeWidth: 0.5,
            draggable: true,
        })
    }

    private snapPoint(point: Point): Point {
        if (settings.snap.isOn) {
            point.x = snapValue(point.x, settings.snap.length)
            point.y = snapValue(point.y, settings.snap.length)
        }

        point.x = Math.max(0, Math.min(settings.map.width, point.x))
        point.y = Math.max(0, Math.min(settings.map.height, point.y))

        return point
    }
}
