export type RoomUser = { id: string; name: string; isAdmin: boolean };

export type RoomUpdate = { roomName: string; room: RoomUser[] };
