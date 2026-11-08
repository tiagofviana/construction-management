export interface IPoint {
    x: number
    y: number
}

export interface ISize {
    width: number
    height: number
}

export interface IInventoryRoom {
    id: string
    name: string
    description: string
    area: number
    svgPath: string
    svgViewBox: string
    color: string
}

export interface IInventoryItem {
    id: string
    name: string
    description: string
    svg: string
    categoryId: number
    positionX: number
    positionY: number
    rotation: number
}
