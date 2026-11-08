import type { IRoom, IPoint } from '../../types'

class Rooms {
    private rooms: Map<string, IRoom>
    public onRoomsChange: (rooms: Array<IRoom>) => void

    constructor() {
        this.rooms = new Map()
        this.onRoomsChange = () => {}
    }

    public setRooms(rooms: Array<IRoom>): void {
        this.rooms.clear()
        rooms.forEach((room) => {
            this.rooms.set(room.id, room)
        })
    }

    public getRooms(): Array<IRoom> {
        return [...this.rooms.values()]
    }

    public getRoomById(id: string): IRoom | undefined {
        return this.rooms.get(id)
    }

    public updateRoomPosition(id: string, point: IPoint): void {
        const room = this.getRoomById(id)

        if (!room) {
            console.log(`Could not find the room ${id}`)
            return
        }

        room.positionX = point.x
        room.positionY = point.y

        this.rooms.set(id, room)
        this.onRoomsChange(this.getRooms())
    }

    public updateRoomRotation(id: string, rotation: number): void {
        const room = this.getRoomById(id)

        if (!room) {
            console.log(`Could not find the room ${id}`)
            return
        }

        room.rotation = rotation

        this.rooms.set(id, room)
        this.onRoomsChange(this.getRooms())
    }
}

export const rooms = new Rooms()
