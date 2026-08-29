import Konva from 'konva'
import type { Group } from 'konva/lib/Group'
import type { IRect } from 'konva/lib/types'
import { rooms, tool, settings } from '../../core'
import type { Room, Point } from '../../../types'
import { computeCentroid, snapValue } from '../../../utils'
import type { RotationHandler } from './rotation'

export class Shape {
    private room: Room
    private group: Group
    private textCentroid: Point | null = null
    private rotationHandler: RotationHandler
    public onDoubleClick: (roomId: string) => void

    constructor(room: Room, group: Group, rotationHandler: RotationHandler) {
        this.rotationHandler = rotationHandler
        this.room = room
        this.onDoubleClick = () => {}

        const center = this.getCenterPoint()

        this.group = new Konva.Group({
            name: `shape_#${room.id}`,
            x: this.room.positionX + center.x,
            y: this.room.positionY + center.y,
            offsetX: center.x,
            offsetY: center.y,
            rotation: this.room.rotation,
            draggable: false,
        })
        group.add(this.group)
        this.setGroupEvents()
    }

    public getPosition(): Point {
        const center = this.getCenterPoint()

        return {
            x: this.group.x() - center.x,
            y: this.group.y() - center.y,
        }
    }

    public setPosition(point: Point) {
        const center = this.getCenterPoint()

        this.group.position({
            x: point.x + center.x,
            y: point.y + center.y,
        })

        this.room.positionX = point.x
        this.room.positionY = point.y

        rooms.updateRoomPosition(this.room.id, point)
    }

    private setGroupEvents() {
        const container = this.group.getStage()!.container() as HTMLDivElement

        this.group.on('dblclick', () => this.onDoubleClick(this.room.id))

        this.group.on('dragmove', () => {
            this.rotationHandler.clear()
            this.constraintDrag()
        })

        this.group.on('click', () => {
            // this.rotationHandler.draw(this)
            // this.rotationHandler.moveToTop()
            this.group.moveToTop()
        })

        this.group.on('dragend', () => {
            const center = this.getCenterPoint()
            const point = {
                x: Math.round(this.group.x() - center.x),
                y: Math.round(this.group.y() - center.y),
            }
            rooms.updateRoomPosition(this.room.id, point)
        })

        this.group.on('mouseover mouseup', () => {
            const activeTool = tool.selected

            if (activeTool === 'select' && container.style.cursor !== 'grab') {
                container.style.cursor = 'grab'
            }
        })

        this.group.on('mousedown', () => {
            if (tool.selected === 'select' && container.style.cursor !== 'grabing') {
                container.style.cursor = 'grabbing'
            }
        })

        this.group.on('mouseout', () => {
            if (tool.selected === 'select') {
                container.style.removeProperty('cursor')
            }
        })
    }

    private constraintDrag() {
        const center = this.getCenterPoint()
        const rect = this.group.getClientRect({ relativeTo: this.group })
        const point = {
            x: Math.round(this.group.x() - center.x),
            y: Math.round(this.group.y() - center.y),
        }

        if (settings.snap.isOn) {
            point.x = snapValue(point.x, settings.snap.length)
            point.y = snapValue(point.y, settings.snap.length)
        }

        point.x = Math.max(0, point.x)
        point.y = Math.max(0, point.y)

        if (point.x + rect.width > settings.map.width) {
            point.x = settings.map.width - rect.width
        }

        if (point.y + rect.height > settings.map.height) {
            point.y = settings.map.height - rect.height
        }

        this.group.setPosition({
            x: point.x + center.x,
            y: point.y + center.y,
        })
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

    public getRoomId(): string {
        return this.room.id
    }

    public update(room: Room): void {
        Object.assign(this.room, room)
        this.draw()
    }

    public getDimentions(): IRect {
        const rect = this.group.getClientRect()
        const position = this.group.getPosition()

        return {
            width: rect.width,
            height: rect.height,
            x: position.x - rect.width / 2,
            y: position.y - rect.height / 2,
        }
    }

    public getColor() {
        return this.room.color
    }

    public getRotation(): number {
        return this.group.rotation()
    }

    public setRotation(rotation: number) {
        this.group.rotation(rotation)
    }
    public setDraggable(isDraggable: boolean) {
        this.group.draggable(isDraggable)

        if (isDraggable === false) {
            this.rotationHandler.clear()
        }
    }
}
