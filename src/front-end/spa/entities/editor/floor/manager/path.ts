import { snapValue } from '../utils'
import type { Config, PathCommand } from '../types'

export class PathManager {
    private path: Array<PathCommand> = []

    constructor(
        private config: Config,
        initialPath: Array<PathCommand> = [],
    ) {
        this.path = initialPath
    }

    public getPath(): Array<PathCommand> {
        return this.path
    }

    public setPath(path: Array<PathCommand>): void {
        this.path = path
    }

    public clear(): void {
        this.path = []
    }

    public addCommand(cmd: PathCommand): boolean {
        if (this.isOutsideX(cmd.x) || this.isOutsideY(cmd.y)) {
            return false
        }

        const validCmd = this.applySnapAndValidation(cmd)
        this.path.push(validCmd)
        return true
    }

    public getLastCommand(): PathCommand | null {
        return this.path.at(-1) ?? null
    }

    public isEmpty(): boolean {
        return this.path.length === 0
    }

    public getLength(): number {
        return this.path.length
    }

    private applySnapAndValidation(cmd: PathCommand): PathCommand {
        const result = { ...cmd }

        if (this.config.isSnapOn) {
            result.x = snapValue(result.x, this.config.snapLength)
            result.y = snapValue(result.y, this.config.snapLength)

            if ('x1' in result && 'y1' in result) {
                result.x1 = snapValue(result.x1, this.config.snapLength)
                result.y1 = snapValue(result.y1, this.config.snapLength)
            }

            if ('x2' in result && 'y2' in result) {
                result.x2 = snapValue(result.x2, this.config.snapLength)
                result.y2 = snapValue(result.y2, this.config.snapLength)
            }
        }

        return result
    }

    private isOutsideX(value: number): boolean {
        return value < 0 || value > this.config.width
    }

    private isOutsideY(value: number): boolean {
        return value < 0 || value > this.config.height
    }
}
