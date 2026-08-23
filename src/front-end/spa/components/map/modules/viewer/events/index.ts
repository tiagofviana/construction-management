import type { Stage } from 'konva/lib/Stage'
import { Zoom } from './zoom'
import { Pan } from './pan'

export class EventsHandler {
    public zoom: Zoom
    public pan: Pan

    constructor(stage: Stage) {
        this.zoom = new Zoom(stage)
        this.pan = new Pan(stage)
    }
}
