import type { Stage } from 'konva/lib/Stage'
import type { Settings } from '../core/settings'
import type { ISize } from '../types'
import { Zoom } from './zoom'
import { Pan } from './pan'

export class EventsHandler {
    public zoom: Zoom
    public pan: Pan

    constructor(stage: Stage, settings: Settings, getMapSize: () => ISize) {
        this.zoom = new Zoom(stage, settings, getMapSize)
        this.pan = new Pan(stage, settings, getMapSize)

        // Without it the map jumps to the limits on the next drag
        this.zoom.onZoom = () => this.pan.clamp()
    }
}
