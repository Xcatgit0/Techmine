import { MathUtils } from 'three';
let { DEG2RAD, RAD2DEG } = MathUtils;
import { getSchema } from "./core/BufferPacketSchemas.js";
import { decode } from "./core/BufferPacket.js";
import { Player } from "./PlayerPacket.js";
import * as three from 'three';
import disposeGroup from "./disposer.js";
import { createPlayerMesh } from "./player.js";
import { hash } from "./Server/Hash.js";
export class OtherPlayerManager {
    constructor() {
        /** @type {Map<String,three.Group>} */
        this.players = new Map();
	this.hashs = new Map();
        this.group = new three.Group();
	this.vec3 = new three.Vector3();
    }
    addPlayer(uuid, displayName) {
        let mesh = createPlayerMesh(displayName);
	this.group.add(mesh)
        this.players.set(uuid, mesh);
	this.hashs.set(hash(uuid),mesh);
    }
    remove(uuid) {
        let mesh = this.players.get(uuid);
        disposeGroup(mesh);
        this.players.delete(uuid);
	this.hashs.delete(hash(uuid));
    }
    updateBuf(buffer) {
	let decoded = decode(buffer, getSchema("PlayerPosition"));
        //this.cam.x = decoded.camX;
        //this.cam.y = decoded.camY;
        //this.pos.x = decoded.x;
        //this.pos.y = decoded.y;
        //this.pos.z = decoded.z;
	let mesh = this.hashs.get(decoded.hash);
	this.vec3.set(decoded.x,decoded.y,decoded.z);
	mesh.position.lerp(
	    this.vec3,
	    0.35
	);
	mesh.rotation.y = decoded.camX * DEG2RAD;
    }
}
