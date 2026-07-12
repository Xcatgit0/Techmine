import { getSchema } from "./core/BufferPacketSchemas.js";
import { decode } from "./core/BufferPacket.js";
export class Player {
    constructor(uuid, displayName = "Steve"
    ) {
        this.type = "Player";
        this.displayName = displayName;
        this.uuid = uuid;
        this.pos = { x: 0, y: 0, z: 0 };
        this.cam = { x: 0, y: 0 };
        this.con = null;
    }
    remove() { }
    updateFromBuffer(buffer) {
        let decoded = decode(buffer, getSchema("PlayerPosition"));
        this.cam.x = decoded.camX;
        this.cam.y = decoded.camY;
        this.pos.x = decoded.x;
        this.pos.y = decoded.y;
        this.pos.z = decoded.z;
        this.lastupdate = decoded.timestamp;
    }
}
export function createPlayerInitPacket(uuid, displayName = "Steve") {
    let data = JSON.stringify({
        type: "PlayerInit",
        uuid: uuid,
        displayName: displayName
    });
    return data;
}
export function initPlayerFromData(data) {
    return new Player(data.uuid, data.displayName);
}