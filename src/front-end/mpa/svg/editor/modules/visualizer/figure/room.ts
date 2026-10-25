import Konva from 'konva'
import type { Label } from 'konva/lib/shapes/Label'
import type { Point } from '../types'
import { Figure } from './figure'

export class Room extends Figure {
    private rect: Konva.Rect | null = null

    public setColor(color: string) {
        if (!/^#([0-9A-Fa-f]{6})$/.test(color)) return

        this.settings.room.color = color
        this.rect?.fill(color)
    }

    public draw() {
        const { margin, color } = this.settings.room
        const width = this.settings.map.width - margin * 2
        const height = this.settings.map.height - margin * 2

        this.rect = new Konva.Rect({
            x: margin,
            y: margin,
            width,
            height,
            fill: color,
            stroke: 'rgba(0,0,0,.3)',
            strokeWidth: 1.6,
            listening: false,
        })
        this.group.add(this.rect)

        const centerX = margin + width / 2
        const centerY = margin + height / 2

        this.addMeasure(width, { x: centerX, y: margin })
        this.addMeasure(width, { x: centerX, y: margin + height })
        this.addMeasure(height, { x: margin, y: centerY })
        this.addMeasure(height, { x: margin + width, y: centerY })
    }

    private addMeasure(length: number, center: Point) {
        const label = this.createLabel(`${length / 100}m`)
        const bounds = label.getClientRect()

        label.position({
            x: center.x - bounds.width / 2,
            y: center.y - bounds.height / 2,
        })

        this.group.add(label)
    }

    private createLabel(text: string): Label {
        const label = new Konva.Label({ listening: false })

        label.add(
            new Konva.Tag({
                fill: '#ffffff',
                cornerRadius: 4,
                shadowColor: '#000',
                shadowBlur: 5,
                shadowOpacity: 0.6,
            }),
        )

        label.add(
            new Konva.Text({
                text,
                fontSize: 16,
                fontFamily: 'monospace',
                fill: 'black',
                align: 'center',
                padding: 6,
            }),
        )

        return label
    }
}
