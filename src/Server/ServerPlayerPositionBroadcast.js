import { getSchema } from "../core/BufferPacketSchemas.js";
import { encode } from "../core/BufferPacket.js";
import { hash } from "./Hash.js";

/** @typedef {Map<String,import("../PlayerPacket.js").Player>} Players */

export class ServerPlayerPositionBroadcast {

    constructor(players, fps = 20) {
        this.players = players;
        this.fps = fps;
        this.intervalTime = 1000 / fps;
        this.interval = null;
        this.hashMap = new Map();
    }

    start() {
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(
            this.broadcast.bind(this),
            this.intervalTime
        );
    }

    broadcast() {

        for (const [uuid, player] of this.players) {
///console.log(uuid,player.hash);
            if (!this.hashMap.has(uuid)) {
                this.hashMap.set(uuid, hash(uuid));
		player.hash = hash(uuid);
            }

            this.broadcastExcept(player);

        }

    }

    broadcastExcept(receiver) {
//if (receiver.uuid=="gag") console.log(receiver.cam.x);
        for (const other of this.players.values()) {

            if (other.uuid === receiver.uuid) continue;
            let encoded = encode({
                timestamp: Date.now(),
                x: other.pos.x,
                y: other.pos.y,
                z: other.pos.z,
                camX: other.cam.x,
                camY: other.cam.y,
                hash: this.hashMap.get(other.uuid)
            }, getSchema("PlayerPosition"));
            receiver.con.send(encoded);

        }

    }

}
