import * as c from './core/core.js';
import { Player } from './player.js';
import * as phys from './core/Physics.js';
import { WriteSliceToChunk } from './core/ChunkSlicer.js';
import { createJoystick } from './core/MobileJoyStick.js';
import { EventEmitter } from './EventEmitter.js';
import { ChunkDataPart } from './Server/package/ChunkDataPart.js';
import { ChunkDataRequest } from './Server/package/ChunkDataRequest.js';
import { WorldLoader2D } from './core/WorldLoadingManager.js';
import { log } from './ScreenLogger.js';
import event from './ClientEvent.js';
import { Generate } from './SimpleWorldGeneration.js';
import pinger from './pinger.js';
import { RendererInfo } from './RendererInfo.js';
import * as bufferPacket from './core/BufferPacket.js';
import { MathUtils } from 'three';
let { DEG2RAD, RAD2DEG } = MathUtils;
import { OtherPlayerManager } from './OtherPlayerManager.js';
import { getSchema, setSchema } from './core/BufferPacketSchemas.js';
import * as PlayerPacket from './PlayerPacket.js';
function _log(...msg) {
    console.log(msg.join(" "));
}
/** @typedef {RendererInfo} RendererInfoType */

let world = new c.World.World();
let physEngine = new phys.PhysicsEngine(c, world);
const joy = createJoystick(150, 'left');
joy.div.style.zIndex = '9999999';
const yaw = createJoystick(150, 'right');
yaw.div.style.zIndex = '9999999';
document.body.appendChild(joy.div);
document.body.appendChild(yaw.div);
let input = joy.input;
window.addEventListener('keydown', (e) => {
    //console.log(e.key);
    if (e.key === 'w') input.y = -1;
    if (e.key === 's') input.y = 1;
    if (e.key === 'a') input.x = -1;
    if (e.key === 'd') input.x = 1;
    if (e.key === 'ArrowLeft') input.yaw = -1;
    if (e.key === 'ArrowRight') input.yaw = 1;
    if (e.key === ' ') { input.pitch = 1 };
});
window.addEventListener('keyup', (e) => {
    if (['w', 's'].includes(e.key)) input.y = 0;
    if (['a', 'd'].includes(e.key)) input.x = 0;
    if (['ArrowLeft', 'ArrowRight'].includes(e.key)) input.yaw = 0;
    if (e.key === ' ') { input.pitch = 0 };
});

let player = new Player(world, joy, physEngine);
player.entity.freeze = true;
/** @type {Map<string,c.Chunk.Chunk>} */
let buildingChunk = new Map();
let playermanager = new OtherPlayerManager();
let ChunkEvent = new EventEmitter();
let SocketHandler = new EventEmitter();
let BufferHandler = new EventEmitter();
let cName = (x, z) => { return `${x}_${z}` };
SocketHandler.on('ChunkDataPart', (data) => {
    const cdp = new ChunkDataPart(data);
    let c = world.getChunk(cdp.chunkX, cdp.chunkZ);
    if (c == null) c = world.createChunk(cdp.chunkX, cdp.chunkZ);
    //console.log(JSON.stringify(cdp));
    buildingChunk.set(cName(cdp.chunkX, cdp.chunkZ), WriteSliceToChunk(c,
        cdp.PartIndex * 16,
        cdp.data,
        true
    ));
    //console.log(cdp.PartIndex, cdp.startY);
    if (cdp.PartIndex === 7) {
        ChunkEvent.emit("chunkRecived", cdp.chunkX, cdp.chunkZ);
    }

});
SocketHandler.on("PlayerJoined", (dat) => {
    let uuid = dat.uuid;
    let displayName = dat.displayName;
    playermanager.addPlayer(uuid, displayName);
});
SocketHandler.on("PlayerLeave", (dat) => {
    playermanager.remove(dat.uuid);
});
/**
 * @type {WebSocket}
 */
let con = null;
function send(dat) {
    if (con == null) {
        log("this client is not connnected yet");
        return;
    }
    con.send(JSON.stringify(dat));
}
let e = document.createElement("a");
e.style.position = "absolute";
e.style.top = "0px";
e.style.right = "0px";
e.innerText = "click me";
document.body.appendChild(e);
let oldPlayerChunk = [0, 0];
function sendPosition() {
    if (typeof con !== "undefined") {
        let data = {
            x: player.position.x,
            y: player.position.y,
            z: player.position.z,
            camX: player.mesh.rotation.y * RAD2DEG,
            camY: 0,
            timestamp: Date.now()
        }
        let encoded = bufferPacket.encode(data, getSchema("PlayerPosition"));
        if (con.readyState == con.OPEN)
            con.send(encoded);
    }
}
let i = 0;
function update(dt, scene) {
    if (oldPlayerChunk[0] !== Math.floor(player.position.x / 16) || oldPlayerChunk[1] !== Math.floor(player.position.z / 16)) {
        worldldr.update();
    }
    let playerCpos = worldldr.getChunkCoords(player.position);
    oldPlayerChunk = [playerCpos.x, playerCpos.z];
    //player.entity.y = 15;
    let dtMil = dt / 1000;
    //if (con != null) worldldr.update();
    player.update(dt);
    physEngine.update(dtMil);
    //physEngine.createDebugHitboxes(scene);
    if (i == 3) {
        sendPosition();
        i = 0;
    }
    i++;
}
/**
 * @type {pinger}
 */
let ping;
let retryToConnect = 3;
async function connect(addr, protocol = "ws://") {

    //delete con
    event.emit("Connecting")
    con = new WebSocket(protocol + addr);
    con.binaryType = "arraybuffer";
    ping = new pinger(con);
    con.addEventListener("message", (e, isBinary) => {
        let str = (e.data?.toString) ? e.data.toString() : "";
        if (isBinary) {
            let dv = new DataView(e.data);
            let type = dv.getUint8(0);
            BufferHandler.emit(`${type}`, e.data);
        }
        let data = JSON.parse(e.data);
        SocketHandler.emit(data.type ?? "", data);
    });
    con.addEventListener("close", () => {
        ping.stop();
        player.entity.freeze = true;
        event.emit("Disconnected");
        log("Connection lost. attempting to reconnect...");
        //log("Trying to reconnect.");
        if (retryToConnect === 0) {
            log("Stop attempting to reconnect.", 5000);
            return;
        }
        retryToConnect--;
        log("Trying in 5 seconds.");
        setTimeout(async () => {
            await connect(addr, protocol);
        }, 5000);
    });
    con.addEventListener("error", (ev) => {
        log("Failed to connect Websocket");
    });
    con.addEventListener("open", async () => {
        setTimeout(worldldr.update, 5000);
        ping.start();
        player.entity.freeze = false;
        event.emit("Connected");
        retryToConnect = 3;
        player.entity.y = 60;
        log("Connected to " + JSON.stringify(addr), 5000);
        await new Promise((res) => setTimeout(res, 1000));
        let chunk = await getChunk(0, 0);
        //log(chunk);
        world.setChunk(0, 0, chunk);
        world.getChunk(0, 0).inRenderRange = true;
        //chunk.datas[0][0][5] = new c.Voxel.Voxel("techmine:stone");
        chunk.render(world.groups);
        con.send(PlayerPacket.createPlayerInitPacket("abcdef1234567890", "Achira"));
    });

}
//ChunkEvent.on("chunkRecived", () => console.log("chunk recived"));
let portal = {};
/**
 * 
 * @param {Number} cx 
 * @param {Number} cz 
 * @returns {c.Chunk.Chunk}
 */
function getChunk(cx, cz) {
    // @ts-ignore
    return new Promise((res) => {
        let cdr = new ChunkDataRequest(null);
        cdr.chunkX = cx;
        cdr.chunkZ = cz;
        send(cdr);
        //return buildingChunk.get(cName(cdr.chunkX, cdr.chunkZ));
        ChunkEvent.once("chunkRecived", (x, z) => { res(buildingChunk.get(cName(cdr.chunkX, cdr.chunkZ))); });
    });
}/**
 * 
 * @param {RendererInfoType} info 
 */
function initInfo(info) {
    function getChunkInfo() {
        let loadedChunk = [...world.chunks.values()]
            .filter(c => c.mesh != null);
        let inRenderRange = [...world.chunks.values()]
            .filter(c => c.inRenderRange);
        let unloadedChunk = [...world.chunks.values()]
            .filter(c => c.mesh == null);
        return `💿🎥 Loaded Chunk: ${loadedChunk.length}<br>
        💿📡 InRenderRange Chunk: ${inRenderRange.length} <br>
        💿🖥️ Unload Chunk: ${unloadedChunk.length} `;
    }
    info.register("ChunkInfo", getChunkInfo);
    info.register("Multiplayer", () => {
        return `Ping: ${ping?.ping}ms`;
    });
}
portal.connect = connect;
portal.getChunk = getChunk;
portal.initInfo = initInfo;
// @ts-ignore
let worldldr = new WorldLoader2D(world, player, ChunkEvent, getChunk, con, log);
e.addEventListener("click", () => {
    worldldr.update();
});
event.emit("Init", Date.now())
export {
    portal,
    update,
    joy,
    yaw,
    player,
    world,
    physEngine
};
