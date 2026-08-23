import type { PathCommand } from './types'

export class PathSerializer {
    static toString(path: PathCommand[]): string {
        let result: string = ''
        path.forEach((item) => {
            switch (item.cmd) {
                case 'M':
                    result += `M ${item.x} ${item.y} `
                    break

                case 'L':
                    result += `L ${item.x} ${item.y} `
                    break

                case 'C':
                    result += `C ${item.x1} ${item.y1}, ${item.x2} ${item.y2}, ${item.x} ${item.y} `
                    break

                default:
                    result += ''
                    break
            }
        })
        return result.slice(0, -1)
    }

    static fromString(path: string): PathCommand[] {
        if (!path?.trim()) {
            return []
        }

        const normalizedPath = path.replace(/,/g, ' ').trim()
        const parts = normalizedPath.match(/[MLC]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi)

        if (!parts || parts.length === 0) {
            return []
        }

        const result: PathCommand[] = []
        let index = 0

        while (index < parts.length) {
            const cmd = parts[index]?.toUpperCase()

            if (!cmd || !['M', 'L', 'C'].includes(cmd)) {
                return []
            }

            index += 1

            if (cmd === 'M' || cmd === 'L') {
                const x = Number(parts[index])
                const y = Number(parts[index + 1])

                if (Number.isNaN(x) || Number.isNaN(y)) {
                    return []
                }

                result.push({ cmd, x, y })
                index += 2
                continue
            }

            const x1 = Number(parts[index])
            const y1 = Number(parts[index + 1])
            const x2 = Number(parts[index + 2])
            const y2 = Number(parts[index + 3])
            const x = Number(parts[index + 4])
            const y = Number(parts[index + 5])

            if (
                Number.isNaN(x1) ||
                Number.isNaN(y1) ||
                Number.isNaN(x2) ||
                Number.isNaN(y2) ||
                Number.isNaN(x) ||
                Number.isNaN(y)
            ) {
                return []
            }

            result.push({ cmd: 'C', x1, y1, x2, y2, x, y })
            index += 6
        }

        return result
    }
}
