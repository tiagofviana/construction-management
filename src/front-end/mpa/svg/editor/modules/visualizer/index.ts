import Konva from 'konva'
import type { Stage } from 'konva/lib/Stage'
import { DrawManager } from './figure'
import { EventsHandler } from './events'
import { Settings } from './core/settings'
import { SVGParser } from './core/svg'
import type { Size } from './types'

export { SVGParseError } from './core/svg'

export class SVGCanvas {
    private stage: Stage
    private drawManager: DrawManager
    private resizeObserver: ResizeObserver
    // Ignores SVGs that finish loading after a newer one was requested
    private loadId = 0
    public readonly settings = new Settings()
    public eventsHandler: EventsHandler

    constructor(elmt: HTMLDivElement) {
        this.stage = new Konva.Stage({
            container: elmt,
            width: elmt.clientWidth,
            height: elmt.clientHeight,
        })
        this.stage.container().style.cursor = 'grab'

        const layer = new Konva.Layer({ listening: true })
        this.stage.add(layer)

        this.drawManager = new DrawManager(layer, this.settings)
        this.eventsHandler = new EventsHandler(this.stage, this.settings)

        this.resizeObserver = new ResizeObserver(() => {
            this.stage.size({ width: elmt.clientWidth, height: elmt.clientHeight })
        })
        this.resizeObserver.observe(elmt)
    }

    public setup() {
        this.drawManager.draw()
        this.centralize()
    }

    public async setSVG(data: string): Promise<boolean> {
        const id = ++this.loadId

        try {
            const svgImage = await new SVGParser(data).loadImage()
            if (id !== this.loadId) return false

            this.drawManager.object.setImage(svgImage)
            return true
        } catch (error) {
            if (id !== this.loadId) return false

            this.drawManager.object.setImage(null)
            throw error
        }
    }

    public setColor(color: string) {
        this.drawManager.room.setColor(color)
    }

    // The size is the room size; the floor also includes the margin around the room
    public setMapSize(size: Size) {
        const margin = this.settings.room.margin * 2
        this.settings.map.width = size.width * 10 + margin
        this.settings.map.height = size.height * 10 + margin

        this.drawManager.draw()
    }

    public centralize() {
        this.eventsHandler.zoom.reset()
        this.eventsHandler.pan.centralize()
    }

    public destroy() {
        this.loadId++
        this.resizeObserver.disconnect()
        this.stage.destroy()
    }
}
