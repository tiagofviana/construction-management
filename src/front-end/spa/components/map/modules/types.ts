export interface IPoint {
    x: number
    y: number
}

export interface ISize {
    width: number
    height: number
}

export type PathCommand = IMoveCmd | ILineCmd | ICurveCmd

export interface IMoveCmd {
    cmd: 'M'
    x: number
    y: number
}
export interface ILineCmd {
    cmd: 'L'
    x: number
    y: number
}
export interface ICurveCmd {
    cmd: 'C'
    x: number
    y: number
    x1: number
    y1: number
    x2: number
    y2: number
}

export interface IRoom {
    id: string
    name: string
    description: string
    svgPath: string
    svgViewBox: string
    area: number
    color: string
    positionX: number
    positionY: number
    rotation: number
    width: number
    height: number
}
