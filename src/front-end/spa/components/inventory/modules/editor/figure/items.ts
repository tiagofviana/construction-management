import Konva from 'konva'
import type { Settings } from '../core/settings'
import { SVGParser, type ISVGImage } from '../../viewer/core/svg'
import type { IInventoryItem, IPoint, ISize } from '../../viewer/types'
import type { RotationHandler } from './rotation'

/**
 * Items that can be moved and rotated inside the room.
 * The positions are kept in room coordinates: (0, 0) is the room view box origin
 * and the point is the item top-left corner (without rotation), the same as the API.
 */
export class EditableItems {
    private group = new Konva.Group({ listening: true })
    private settings: Settings
    private rotationHandler: RotationHandler
    private nodes = new Map<string, Konva.Image>()
    private items = new Map<string, IInventoryItem>()
    private roomSize: ISize = { width: 0, height: 0 }
    private highlightedId: string | null = null
    public onItemClick: (itemId: string) => void = () => {}
    public onItemsChange: (items: Array<IInventoryItem>) => void = () => {}

    constructor(layer: Konva.Layer, settings: Settings, rotationHandler: RotationHandler) {
        this.settings = settings
        this.rotationHandler = rotationHandler
        layer.add(this.group)

        this.rotationHandler.onRotationEnd = (itemId, rotation) => {
            const item = this.items.get(itemId)
            if (!item) return

            item.rotation = rotation
            this.emitChange()
        }
    }

    public clear() {
        this.rotationHandler.clear()
        this.nodes.clear()
        this.items.clear()
        this.group.destroyChildren()
    }

    public setRoomSize(size: ISize) {
        this.roomSize = size
    }

    public getItems(): Array<IInventoryItem> {
        return Array.from(this.items.values(), (item) => ({ ...item }))
    }

    /**
     * The nodes are added right away to keep the items order,
     * the image is set once its SVG finishes loading.
     */
    public draw(items: Array<IInventoryItem>) {
        this.clear()

        items.forEach((data) => {
            // A copy keeps the canvas changes away from the caller until they are emitted
            const item = { ...data }
            const node = this.createImage(item)

            this.items.set(item.id, item)
            this.nodes.set(item.id, node)
            this.group.add(node)

            new SVGParser(item.svg)
                .loadImage()
                .then((svgImage) => this.setImage(node, item, svgImage))
                .catch((error) => {
                    console.warn(`The item "${item.name}" (${item.id}) has an invalid SVG.`, error)
                    node.destroy()
                    this.nodes.delete(item.id)
                })
        })
    }

    public setVisibleIds(ids: Set<string>) {
        this.nodes.forEach((node, itemId) => {
            const isVisible = ids.has(itemId)
            node.visible(isVisible)

            if (!isVisible && this.rotationHandler.isDrawnFor(node)) {
                this.rotationHandler.clear()
            }
        })
    }

    public setDraggable(isDraggable: boolean) {
        this.nodes.forEach((node) => node.draggable(isDraggable))

        if (!isDraggable) {
            this.rotationHandler.clear()
        }
    }

    public highlight(itemId: string | null) {
        this.highlightedId = itemId

        this.nodes.forEach((node, id) => {
            const isHighlighted = id === itemId

            node.strokeEnabled(isHighlighted)
            if (isHighlighted) node.moveToTop()
        })
    }

    private emitChange() {
        this.onItemsChange(this.getItems())
    }

    private createImage(item: IInventoryItem): Konva.Image {
        const node = new Konva.Image({
            name: item.id,
            image: undefined,
            rotation: item.rotation,
            stroke: 'rgba(0,0,0,.6)',
            strokeWidth: 2,
            // Keeps the border width when zooming
            strokeScaleEnabled: false,
            strokeEnabled: item.id === this.highlightedId,
            draggable: false,
        })

        this.setImageEvents(node, item)
        return node
    }

    private setImage(node: Konva.Image, item: IInventoryItem, svgImage: ISVGImage) {
        const { image, size } = svgImage

        // The offset keeps the rotation around the item center
        node.setAttrs({
            image,
            width: size.width,
            height: size.height,
            offsetX: size.width / 2,
            offsetY: size.height / 2,
            draggable: this.settings.tool === 'select',
        })

        // Without snap the saved position is kept as it is
        node.position({
            x: item.positionX + node.offsetX() + this.settings.map.padding,
            y: item.positionY + node.offsetY() + this.settings.map.padding,
        })
    }

    private setImageEvents(node: Konva.Image, item: IInventoryItem) {
        const container = () => node.getStage()?.container()

        node.on('click tap', () => {
            this.onItemClick(item.id)
            if (this.settings.tool !== 'select') return

            node.moveToTop()
            this.rotationHandler.draw(node)
        })

        node.on('dragstart', () => this.rotationHandler.clear())
        node.on('dragmove', () => this.constrainDrag(node))

        node.on('dragend', () => {
            const point = this.getNodePosition(node)
            item.positionX = point.x
            item.positionY = point.y
            this.emitChange()
        })

        node.on('mouseover mouseup', () => {
            if (this.settings.tool === 'select') container()?.style.setProperty('cursor', 'grab')
        })

        node.on('mousedown', () => {
            if (this.settings.tool === 'select') {
                container()?.style.setProperty('cursor', 'grabbing')
            }
        })

        node.on('mouseout', () => container()?.style.removeProperty('cursor'))
    }

    // Converts the node center (map coordinates) to the item corner (room coordinates)
    private getNodePosition(node: Konva.Image): IPoint {
        const padding = this.settings.map.padding

        return {
            x: Math.round(node.x() - node.offsetX() - padding),
            y: Math.round(node.y() - node.offsetY() - padding),
        }
    }

    // Applies the snap and keeps the item inside the room
    private constrainDrag(node: Konva.Image) {
        const padding = this.settings.map.padding
        const { isOn, length } = this.settings.snap
        let { x, y } = this.getNodePosition(node)

        if (isOn) {
            x = Math.round(x / length) * length
            y = Math.round(y / length) * length
        }

        x = Math.min(Math.max(x, 0), Math.max(this.roomSize.width - node.width(), 0))
        y = Math.min(Math.max(y, 0), Math.max(this.roomSize.height - node.height(), 0))

        node.position({
            x: x + node.offsetX() + padding,
            y: y + node.offsetY() + padding,
        })
    }
}
