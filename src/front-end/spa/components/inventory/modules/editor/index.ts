import Konva from 'konva'
import type { Stage } from 'konva/lib/Stage'
import { Settings, type ToolOptions } from './core/settings'
import { EventsHandler } from './events'
import { Grid } from './figure/grid'
import { EditableItems } from './figure/items'
import { RotationHandler } from './figure/rotation'
import { Room } from '../viewer/figure/room'
import type { IInventoryRoom, IInventoryItem, ISize } from '../viewer/types'

export type { ToolOptions } from './core/settings'

export class InventoryEditorCanvas {
    private stage: Stage
    private room: Room
    private grid: Grid
    private items: EditableItems
    private rotationHandler: RotationHandler
    private roomSize: ISize = { width: 0, height: 0 }
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

        // The order of creation is the drawing order: room, grid, items and the rotation handler
        this.room = new Room(layer, this.settings)
        this.grid = new Grid(layer, this.settings)
        this.rotationHandler = new RotationHandler(layer)
        this.items = new EditableItems(layer, this.settings, this.rotationHandler)
        this.rotationHandler.moveToTop()

        this.eventsHandler = new EventsHandler(this.stage, this.settings, () =>
            this.room.getMapSize(),
        )

        // Clicking outside the items hides the rotation handler
        this.stage.on('click tap', (e) => {
            if (e.target === this.stage) this.rotationHandler.clear()
        })

        this.resizeObserver = new ResizeObserver(() => {
            this.stage.size({ width: elmt.clientWidth, height: elmt.clientHeight })
        })
        this.resizeObserver.observe(elmt)
    }

    public setRoom(room: IInventoryRoom) {
        const [, , width, height] = room.svgViewBox.split(' ').map(Number)
        this.roomSize = { width, height }

        this.room.draw(room)
        this.items.setRoomSize(this.roomSize)
        this.grid.draw(this.roomSize)
        this.centralizeZoom()
    }

    public setItems(items: Array<IInventoryItem>) {
        this.items.draw(items)
    }

    public getItems(): Array<IInventoryItem> {
        return this.items.getItems()
    }

    public setVisibleIds(ids: Set<string>) {
        this.items.setVisibleIds(ids)
    }

    public highlightItem(itemId: string | null) {
        this.items.highlight(itemId)
    }

    public setItemClick(callback: (itemId: string) => void) {
        this.items.onItemClick = callback
    }

    public set onItemsChange(callback: (items: Array<IInventoryItem>) => void) {
        this.items.onItemsChange = callback
    }

    public setTool(option: ToolOptions) {
        this.settings.tool = option
        this.items.setDraggable(option === 'select')
        this.stage.container().style.removeProperty('cursor')
    }

    public gridVisibility(isVisible: boolean) {
        this.settings.grid.isVisible = isVisible
        this.grid.draw(this.roomSize)
    }

    public setSnap(isOn: boolean) {
        this.settings.snap.isOn = isOn
    }

    // Fits the whole room inside the stage and centralizes it
    public centralizeZoom() {
        this.eventsHandler.zoom.fit()
        this.eventsHandler.pan.centralize()
        this.eventsHandler.onZoomChange(this.stage.scaleX())
    }

    public destroy() {
        this.items.clear()
        this.resizeObserver.disconnect()
        this.stage.destroy()
    }
}
