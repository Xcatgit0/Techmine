import { Player } from "../PlayerPacket.js";
import { getSchema } from "../core/BufferPacketSchemas.js";
import { encode } from "../core/BufferPacket.js";
import { hash } from "./Hash.js";
/** @typedef {Map<String,Player>} Players*/
export class ServerPlayerPositionBroadcast {/**
 * 
 * @param {Players} players 
 * @param {Number} fps 
 */
    constructor(players, fps = 20) {
        /** @type {Players} */
        this.players = players;
        this.fps = 20;
        this.intervalTime = 1000 / this.fps;
        this.interval = null;
	this.hashMap = new Map();
    }
    start() {
        this.interval = setInterval(this.broadcast.bind(this), this.intervalTime);
    }
    broadcast() {
        for (let k of this.players.keys()) {
            let p = this.players.get(k);
            if (!this.hashMap.has(p.uuid)) { this.hashMap.set(p.uuid,hash(p.uuid)) }
            this.broadcastExept(p.uuid);
        }
    }
    broadcastExept(uuid) {
        let filtered = [...this.players.values()]
            .filter(p => p.uuid !== uuid);
        filtered.forEach((p) => {
            let encoded = encode({
                timestamp: Date.now(),
                x: p.pos.x,
                y: p.pos.y,
                z: p.pos.z,
                camX: p.cam.x,
                camY: p.cam.y,
		hash: this.hashMap.get(uuid)
            }, getSchema("PlayerPosition"));
            p.con.send(encoded);
        });
    }
}
