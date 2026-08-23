import type { Layer } from 'konva/lib/Layer'
import { Group } from 'konva/lib/Group'
import { Shape } from './shape'
import { rooms } from '../../core/room'
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
    }

    public setDraggable(isDraggable: boolean) {
        this.group.listening(isDraggable)

        if (isDraggable === false) {
            this.rotationHandler.clear()
        }
    }
}
