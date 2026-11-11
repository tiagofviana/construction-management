import { Settings as ViewerSettings } from '../../viewer/core/settings'

export type ToolOptions = null | 'select'

export class Settings extends ViewerSettings {
    grid = {
        isVisible: true,
        size: 10,
    }
    snap = {
        isOn: true,
        length: 5,
    }
    tool: ToolOptions = null
}
