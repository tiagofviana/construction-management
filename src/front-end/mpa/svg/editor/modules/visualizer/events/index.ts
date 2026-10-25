import type { Stage } from 'konva/lib/Stage'
import type { Settings } from '../core/settings'
import { Zoom } from './zoom'
import { Pan } from './pan'

export class EventsHandler {
    public zoom: Zoom
    public pan: Pan

    constructor(stage: Stage, settings: Settings) {
        this.zoom = new Zoom(stage, settings)
        this.pan = new Pan(stage, settings)
    }
}
