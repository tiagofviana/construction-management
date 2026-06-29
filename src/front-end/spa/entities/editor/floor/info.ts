import Konva from 'konva'
import type { Layer } from 'konva/lib/Layer'
import type { Label } from 'konva/lib/shapes/Label'
import type { Text } from 'konva/lib/shapes/Text'
import type { PathCommand } from './types'

export class Info {
    private group = new Konva.Group({ listening: false })

    constructor(layer: Layer) {
        layer.add(this.group)
    }

    public destroy() {
        this.group.destroy()
    }

    public clear() {
        this.group.destroyChildren()
    }

    public draw(path: Array<PathCommand>) {
        this.group.destroyChildren()

        for (let i = 1; i < path.length; i++) {
            const previous = path[i - 1]
            const current = path[i]

            if (current.cmd === 'L') {
                this.createLineLabels(previous, current)
            }
        }
    }

    private createLineLabels(previus: PathCommand, current: PathCommand) {
        const dx = current.x - previus.x
        const dy = current.y - previus.y
        const lineSize = Math.round(Math.sqrt(dx * dx + dy * dy))

        if (lineSize < 1) return

        const midX = (previus.x + current.x) / 2
        const midY = (previus.y + current.y) / 2

        const text = `${lineSize / 100}m`

        const label = this.createLabel(text)
        const bounds = label.getClientRect()

        label.position({
            x: midX - bounds.width / 2,
            y: midY - bounds.height / 2,
        })

        this.group.add(label)
    }

    private createLabel(text: string): Label {
        const label = new Konva.Label({
            listening: false,
        })

        label.add(this.createTag())
        label.add(this.createText(text))

        return label
    }

    private createText(text: string): Text {
        return new Konva.Text({
            text: text,
            fontSize: 16,
            fontFamily: 'monospace',
            fill: '#000000',
            align: 'center',
            padding: 6,
        })
    }

    private createTag() {
        return new Konva.Tag({
            fill: '#ffffff',
            cornerRadius: 4,
            shadowColor: '#000',
            shadowBlur: 5,
            shadowOpacity: 0.6,
            opacity: 1,
        })
    }
}
