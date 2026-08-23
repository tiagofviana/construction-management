import Konva from 'konva'
import type { Circle } from 'konva/lib/shapes/Circle'
import type { Point } from '../../../types'
import { Figure } from '../figure'
import { svgPath, snapPoint } from '../../core'

export class Vertices extends Figure {
    public onVerticeChange: () => void = () => {}

    public draw(): void {
        this.group.destroyChildren()
        this.group.listening(true)

        const path = svgPath.getPath()
        const lastIndex = path.length - 1

        path.forEach((item, index) => {
            const color = lastIndex === index ? '#a31818' : '#faa032'
            const circle = this.createCircle({ x: item.x, y: item.y }, color)
            const container = this.group.getStage()!.container() as HTMLDivElement

            circle.on('dragmove', () => {
                const point = snapPoint({
                    x: Math.round(circle.x()),
                    y: Math.round(circle.y()),
                })

                circle.setPosition(point)
                item.x = point.x
                item.y = point.y

                this.onVerticeChange()
            })

            circle.on('dragend', () => {
                svgPath.setPath(path)
            })

            circle.on('mouseover', () => {
                if (container.style.cursor !== 'all-scroll') {
                    container.style.cursor = 'all-scroll'
                }
            })

            circle.on('mouseout', () => {
                container.style.removeProperty('cursor')
            })

            this.group.add(circle)
        })
    }

    public clear(): void {
        this.group.listening(false)
        this.group.destroyChildren()
    }

    private createCircle(point: Point, color: string): Circle {
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
            shadowOffset: { x: 1, y: 1 },
            shadowOpacity: 0.6,
            draggable: true,
        })
    }
}
