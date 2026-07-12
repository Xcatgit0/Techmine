import { Player } from "../PlayerPacket.js";
import { getSchema } from "../core/BufferPacketSchemas.js";
import { encode } from "../core/BufferPacket.js";
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
    }
    start() {
        this.interval = setInterval(function () { }, this.intervalTime);
    }
    broadcast() {
        for (let k in this.players.keys()) {
            let p = this.players.get(k);
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
                camY: p.cam.y
            }, getSchema("PlayerPosition"));
            p.con.send(encoded);
        });
    }
}