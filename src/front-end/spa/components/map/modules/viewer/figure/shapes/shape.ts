import Konva from 'konva'
import type { Group } from 'konva/lib/Group'
import type { Room, Point } from '../../../types'
import { computeCentroid } from '../../../utils'

export class Shape {
    private room: Room
    private group: Group
    private textCentroid: Point | null = null
    public onDoubleClick: (roomId: string) => void

    constructor(room: Room, group: Group) {
        this.room = room
        this.onDoubleClick = () => {}

        const center = this.getCenterPoint()

        this.group = new Konva.Group({
            x: this.room.positionX + center.x,
            y: this.room.positionY + center.y,
            offsetX: center.x,
            offsetY: center.y,
            rotation: this.room.rotation,
            listening: true,
            draggable: false,
        })
        this.group.on('dblclick', () => this.onDoubleClick(this.room.id))
        group.add(this.group)
    }

    public draw() {
        this.group.destroyChildren()

        const path = this.createKonvaPath()
        const text = this.createText()
        this.group.add(path, text)

        this.updateTextPosition()
    }

    private createKonvaPath(): Konva.Path {
        const [viewBoxX, viewBoxY] = this.getViewBox()

        return new Konva.Path({
            name: 'shape-path',
            data: this.room.svgPath,
            x: -viewBoxX,
            y: -viewBoxY,
            fill: this.room.color,
            strokeWidth: 1,
            stroke: 'rgba(0,0,0,.6)',
        })
    }

    private findPath(): Konva.Path {
        return this.group.findOne('.shape-path') as Konva.Path
    }

    private findText(): Konva.Text {
        return this.group.findOne('.shape-text') as Konva.Text
    }

    private createText(): Konva.Text {
        return new Konva.Text({
            name: 'shape-text',
            text: `${this.room.name}\n${this.room.area} m²`,
            fontSize: 15,
            fontFamily: 'Inter, Arial, sans-serif',
            fontStyle: '600',
            fill: 'rgba(0,0,0,.8)',
            align: 'center',
            verticalAlign: 'middle',
        })
    }

    private getViewBox() {
        const [x, y, width, height] = this.room.svgViewBox.split(' ').map(Number)
        return [x, y, width, height]
    }

    private getCenterPoint(): Point {
        const [, , width, height] = this.getViewBox()

        return {
            x: width / 2,
            y: height / 2,
        }
    }

    private updateTextPosition() {
        const text = this.findText()

        if (!this.textCentroid) {
            const [viewBoxX, viewBoxY] = this.getViewBox()
            const centroid = computeCentroid(this.room.svgPath)

            this.textCentroid = {
                x: centroid.x - viewBoxX,
                y: centroid.y - viewBoxY,
            }
        }

        text.position(this.textCentroid)
        text.offsetX(text.width() / 2)
        text.offsetY(text.height() / 2)
    }
}
