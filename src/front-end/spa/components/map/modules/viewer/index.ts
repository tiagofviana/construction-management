import Konva from 'konva'
import type { Stage } from 'konva/lib/Stage'
import { DrawManager } from './figure'
import { EventsHandler } from './events'
import { settings, rooms } from './core'
import type { Room } from '../types'
import type { Size } from '../floor/CanvasFloorSize.vue'

export class ViewerCanvas {
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

    public setRooms(data: Array<Room>) {
        rooms.setRooms(data)
        this.drawManager.floor.draw()
    }

    public clear() {
        this.drawManager.floor.clear()
    }

    public destroy() {
        this.stage.destroy()
        this.setRooms([])
    }

    public setMapSize(size: Size) {
        settings.map.width = size.width * 10
        settings.map.height = size.height * 10

        this.drawManager.clear()
        this.drawManager.init()
    }

    public setShapeDoubleClick(callback: (value: string) => void) {
        this.drawManager.floor.onShapeDoubleClick = callback
    }
}
