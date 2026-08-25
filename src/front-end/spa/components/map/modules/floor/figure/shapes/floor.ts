import type { Layer } from 'konva/lib/Layer'
import { Group } from 'konva/lib/Group'
import { Shape } from './shape'
import { rooms, settings } from '../../core'
import { RotationHandler } from './rotation'

export class Floor {
    private shapes: Map<string, Shape>
    private group = new Group({ listening: false })
    private rotationHandler: RotationHandler

    constructor(layer: Layer, rotationHandler: RotationHandler) {
        layer.add(this.group)
        this.rotationHandler = rotationHandler
        this.shapes = new Map()
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

            const shape = new Shape(item, this.group, this.rotationHandler)
            shape.draw()
            this.shapes.set(item.id, shape)
        })

        const rect = this.group.getClientRect({ relativeTo: this.group })
        this.group.position({
            x: settings.map.width / 2 - (rect.x + rect.width / 2),
            y: settings.map.height / 2 - (rect.y + rect.height / 2),
        })
    }

    public setDraggable(isDraggable: boolean) {
        this.group.listening(isDraggable)

        if (isDraggable === false) {
            this.rotationHandler.clear()
        }
    }
}
