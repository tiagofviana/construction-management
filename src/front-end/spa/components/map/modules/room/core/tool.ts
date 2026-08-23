export type ToolOptions = null | 'line' | 'select' | 'curve'

class Tool {
    private _selected: ToolOptions = null
    public onChange: (option: ToolOptions) => void
    constructor() {
        this.onChange = () => {}
    }

    public set selected(value: ToolOptions) {
        this._selected = value
        this.onChange(value)
    }

    public get selected(): ToolOptions {
        return this._selected
    }
}

export const tool = new Tool()
