import type { Layer } from 'konva/lib/Layer'
import { Group } from 'konva/lib/Group'
import { Shape } from './shape'
import { rooms } from '../../core'

export class Floor {
    private shapes: Map<string, Shape>
    private group = new Group({ listening: true })
    private highlightedId: string | null = null
    public onShapeDoubleClick: (roomId: string) => void

    constructor(layer: Layer) {
        layer.add(this.group)
        this.shapes = new Map()
        this.onShapeDoubleClick = () => {}
    }

    public clear() {
        this.shapes.clear()
        this.group.destroyChildren()
    }

    public draw() {
        this.clear()

        rooms.getRooms().forEach((item) => {
            const exists = this.shapes.has(item.id)

            if (exists) {
                console.warn(
                    `The room "${item.name}" with "${item.id}" already exists. Ignoring it.`,
                )
                return
            }

            const shape = new Shape(item, this.group)
            shape.draw()
            shape.onDoubleClick = this.onShapeDoubleClick
            this.shapes.set(item.id, shape)
        })

        if (this.highlightedId) {
            this.highlight(this.highlightedId)
        }
    }

    public highlight(roomId: string | null) {
        if (this.highlightedId) {
            this.shapes.get(this.highlightedId)?.setHighlighted(false)
        }

        this.highlightedId = roomId

        if (roomId) {
            this.shapes.get(roomId)?.setHighlighted(true)
        }
    }
}
