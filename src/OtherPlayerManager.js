import { Player } from "./PlayerPacket.js";
import * as three from 'three';
import disposeGroup from "./disposer.js";
import { createPlayerMesh } from "./player.js";
export class OtherPlayerManager {
    constructor() {
        /** @type {Map<String,three.Group>} */
        this.players = new Map();
        this.group = new three.Group();
    }
    addPlayer(uuid, displayName) {
        let mesh = createPlayerMesh(displayName);
        this.players.set(uuid, mesh);
    }
    remove(uuid) {
        let mesh = this.players.get(uuid);
        disposeGroup(mesh);
        this.players.delete(uuid);
    }
}