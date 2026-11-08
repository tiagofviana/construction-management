import type { IRoom } from '../../types'

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
}

export const rooms = new Rooms()
