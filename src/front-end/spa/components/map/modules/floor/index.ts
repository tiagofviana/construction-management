import Konva from 'konva'
import type { Stage } from 'konva/lib/Stage'
import { DrawManager } from './figure'
import { EventsHandler } from './events'
import { settings, ToolOptions, tool, rooms } from './core'
import type { Room } from '../types'
import type { Size } from '../../floorEditor/CanvasFloorSize.vue'

export class FloorCanvas {
    private stage: Stage
    private drawManager: DrawManager
    public eventsHandler: EventsHandler

    constructor(elmt: HTMLDivElement) {
        this.stage = new Konva.Stage({
            container: elmt,
            width: elmt.clientWidth,
            height: elmt.clientHeight,
        })

        this.drawManager = new DrawManager(this.stage)
        this.eventsHandler = new EventsHandler(this.stage)
    }

    public setup() {
        this.eventsHandler.pan.centralize()
        this.eventsHandler.zoom.reset()
        this.drawManager.init()
    }

    public set onRoomsChange(fn: (rooms: Array<Room>) => void) {
        rooms.onRoomsChange = fn
    }

    public setRooms(data: Array<Room>) {
        rooms.setRooms(data)
        this.drawManager.floor.draw()
    }

    public clear() {
        this.drawManager.floor.clear()
    }

    public get settings() {
        return settings
    }

    public setTool(option: ToolOptions) {
        tool.selected = option
        this.drawManager.floor.setDraggable(option === 'select')

        if (option !== 'select') {
            this.drawManager.rotationHandler.clear()
        }

        this.stage.container().style.removeProperty('cursor')
    }

    public gridVisibility(isVisible: boolean) {
        if (isVisible) {
            this.drawManager.grid.draw()
        } else {
            this.drawManager.grid.clear()
        }
    }

    public destroy() {
        this.stage.destroy()
        this.setRooms([])
    }

    public centralize() {
        this.eventsHandler.zoom.reset()
        const scale = this.stage.scaleX()
        const centerX = (this.stage.width() - settings.map.width * scale) / 2
        const centerY = (this.stage.height() - settings.map.height * scale) / 2

        this.stage.to({
            x: centerX,
            y: centerY,
        })
    }

    public setMapSize(size: Size) {
        settings.map.width = size.width * 10
        settings.map.height = size.height * 10

        this.drawManager.clear()
        this.drawManager.init()
    }
}
