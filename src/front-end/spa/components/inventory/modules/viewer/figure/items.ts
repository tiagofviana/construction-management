import Konva from 'konva'
import type { Settings } from '../core/settings'
import { SVGParser, type ISVGImage } from '../core/svg'
import type { IInventoryItem } from '../types'

export class RoomItems {
    private group = new Konva.Group({ listening: true })
    private settings: Settings
    public onItemClick: (itemId: string) => void = () => {}

    constructor(layer: Konva.Layer, settings: Settings) {
        this.settings = settings
        layer.add(this.group)
    }

    public clear() {
        this.group.destroyChildren()
    }

    /**
     * The nodes are added right away to keep the items order,
     * the image is set once its SVG finishes loading.
     */
    public draw(items: Array<IInventoryItem>) {
        this.clear()

        items.forEach((item) => {
            const node = this.createImage(item)
            this.group.add(node)

            new SVGParser(item.svg)
                .loadImage()
                .then((svgImage) => {
                    this.setImage(node, item, svgImage)
                })
                .catch((error) => {
                    console.warn(`The item "${item.name}" (${item.id}) has an invalid SVG.`, error)
                    node.destroy()
                })
        })
    }

    public highlight(itemId: string | null) {
        this.group.find<Konva.Image>('Image').forEach((image) => {
            const isHighlighted = image.name() === itemId

            image.strokeEnabled(isHighlighted)
            if (isHighlighted) image.moveToTop()
        })
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
            strokeEnabled: false,
        })

        node.on('click tap', () => this.onItemClick(item.id))
        return node
    }

    private setImage(node: Konva.Image, item: IInventoryItem, svgImage: ISVGImage) {
        const { image, size } = svgImage
        const padding = this.settings.map.padding

        // The offset keeps the rotation around the item center
        node.setAttrs({
            image,
            width: size.width,
            height: size.height,
            offsetX: size.width / 2,
            offsetY: size.height / 2,
            x: padding + item.positionX + size.width / 2,
            y: padding + item.positionY + size.height / 2,
        })
    }
}
