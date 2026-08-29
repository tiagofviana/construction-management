import type { Layer } from 'konva/lib/Layer'
import { Group } from 'konva/lib/Group'
import { Shape } from './shape'
import { rooms, settings } from '../../core'
import { RotationHandler } from './rotation'

export class Floor {
    private shapes: Map<string, Shape>
    private group = new Group({ listening: true })
    private rotationHandler: RotationHandler
    public onShapeDoubleClick: (roomId: string) => void

    constructor(layer: Layer, rotationHandler: RotationHandler) {
        layer.add(this.group)
        this.rotationHandler = rotationHandler
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

            const shape = new Shape(item, this.group, this.rotationHandler)
            shape.draw()
            shape.onDoubleClick = this.onShapeDoubleClick
            this.shapes.set(item.id, shape)
        })
    }

    public centerShapes() {
        if (this.shapes.size === 0) return

        const rect = this.group.getClientRect({ relativeTo: this.group })

        const dx = Math.round((settings.map.width - rect.width) / 2 - rect.x)
        const dy = Math.round((settings.map.height - rect.height) / 2 - rect.y)

        if (dx === 0 && dy === 0) return

        rooms.getRooms().forEach((room) => {
            const shape = this.shapes.get(room.id)
            if (!shape) return

            shape.setPosition({
                x: room.positionX + dx,
                y: room.positionY + dy,
            })
        })
    }

    public setDraggable(isDraggable: boolean) {
        this.shapes.forEach((item) => {
            item.setDraggable(isDraggable)
        })
    }
}
