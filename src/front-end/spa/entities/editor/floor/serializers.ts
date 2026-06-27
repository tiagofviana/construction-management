import type { PathCommand } from './types'

export class PathSerializer {
    static toString(path: PathCommand[]): string {
        return path
            .map((item) => {
                switch (item.cmd) {
                    case 'M':
                        return `M ${item.x} ${item.y}`

                    case 'L':
                        return `L ${item.x} ${item.y}`

                    case 'C':
                        return `C ${item.x1} ${item.y1}, ${item.x2} ${item.y2}, ${item.x} ${item.y}`

                    default:
                        return ''
                }
            })
            .join(' ')
    }
}
