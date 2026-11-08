import Konva from 'konva'
import type { Stage } from 'konva/lib/Stage'
import { Settings } from './core/settings'
import { EventsHandler } from './events'
import { Room } from './figure/room'
import { RoomItems } from './figure/items'
import type { IInventoryRoom, IInventoryItem } from './types'

export type { IInventoryRoom, IInventoryItem } from './types'

export class InventoryCanvas {
    private stage: Stage
    private room: Room
    private items: RoomItems
    private resizeObserver: ResizeObserver
    public readonly settings = new Settings()
    public eventsHandler: EventsHandler

    constructor(elmt: HTMLDivElement) {
        this.stage = new Konva.Stage({
            container: elmt,
            width: elmt.clientWidth,
            height: elmt.clientHeight,
        })

        const layer = new Konva.Layer({ listening: true })
        this.stage.add(layer)

        this.room = new Room(layer, this.settings)
        this.items = new RoomItems(layer, this.settings)
        this.eventsHandler = new EventsHandler(this.stage, this.settings, () =>
            this.room.getMapSize(),
        )

        this.resizeObserver = new ResizeObserver(() => {
            this.stage.size({ width: elmt.clientWidth, height: elmt.clientHeight })
        })
        this.resizeObserver.observe(elmt)
    }

    public setRoom(room: IInventoryRoom) {
        this.room.draw(room)
        this.eventsHandler.pan.centralize()
    }

    public setItems(items: Array<IInventoryItem>) {
        return this.items.draw(items)
    }

    public highlightItem(itemId: string | null) {
        this.items.highlight(itemId)
    }

    public setItemClick(callback: (itemId: string) => void) {
        this.items.onItemClick = callback
    }

    public destroy() {
        this.items.clear()
        this.resizeObserver.disconnect()
        this.stage.destroy()
    }
}
