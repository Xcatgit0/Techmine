import * as core from '../core/core.js';
import * as ws from 'ws';
import player from './player.js';
import { ChunkDataRequest } from './package/ChunkDataRequest.js';
import { EventEmitter } from '../EventEmitter.js';
import { ChunkDataPart } from './package/ChunkDataPart.js';
import { SliceChunk } from '../core/ChunkSlicer.js';
import * as playerpac from '../PlayerPacket.js';
import { Generate } from '../SimpleWorldGeneration.js';
import * as bufferpac from '../core/BufferPacket.js';
import { getSchema, setSchema } from '../core/BufferPacketSchemas.js';
let Server = new ws.WebSocketServer({ port: 3080 });
let connections = [];
/** @type {Map<ws.WebSocket,String>} */
let PlayerConnection = new Map();
/** @type {Map<String,playerpac.Player>} */
let Players = new Map();
let World = new core.World.World();
let SocketHandler = new EventEmitter();
let BufferHandler = new EventEmitter();
let package_debug = false;
let PacketInit = () => {
    SocketHandler.on("ping", (d, c) => c.send(JSON.stringify({ type: "pong", })));
    SocketHandler.on('ChunkDataRequest', async (data, con) => {
        let cdr = new ChunkDataRequest(data);
        if (World.getChunk(cdr.chunkX, cdr.chunkZ) == null) {
            console.log("Chunk Generated", cdr.chunkX, cdr.chunkZ);
            let chunk = World.createChunk(cdr.chunkX, cdr.chunkZ);
            Generate(chunk, cdr.chunkX, cdr.chunkZ);
            World.setChunk(cdr.chunkX, cdr.chunkZ, chunk);
        }
        let chunk = World.getChunk(cdr.chunkX, cdr.chunkZ);

        //let dataPart = 0;
        for (let i = 0; i < cdr.totalPart; i++) {
            let cdp = new ChunkDataPart();
            cdp.chunkX = cdr.chunkX;
            cdp.chunkZ = cdr.chunkZ;
            cdp.startY = i * 16;
            cdp.totalPart = cdr.totalPart;
            cdp.PartIndex = i;
            //console.log(dataPart, dataPart + 16);
            cdp.data = SliceChunk(chunk, i * 16, i * 16 + 16, true);
            con.send(JSON.stringify(cdp));
            //dataPart += 16;

            //await new Promise((res) => setTimeout(res, 25));
        }
    });
    SocketHandler.on("PlayerInit", (dat, con, from) => {
        let player = playerpac.initPlayerFromData(dat);
        player.con = con;
        PlayerConnection.set(con, player.uuid);
        Players.set(player.uuid, player);
        function remove() {
            PlayerConnection.delete(con);
            Players.delete(player.uuid);
        }
        player.remove = remove;
        [...PlayerConnection.keys()].forEach((c) => {
            if (c !== con) {
                c.send(JSON.stringify({
                    type: "PlayerJoined",
                    uuid: player.uuid,
                    displayName: player.displayName
                }));
            }
        });
    });
    // === buffer packet ===
    BufferHandler.on('0', (a, con, from) => {
        //console.log(bufferpac.decode(a, getSchema("PlayerPosition")));
        if (Players.has(from)) {
            Players.get(from).updateFromBuffer(a);
        }
//        console.log(Players);
    });
}
PacketInit();
World.createChunk(0, 0);
let cc = World.getChunk(0, 0);
Generate(cc, cc.cx, cc.cz);
cc.modifiedChunk = true;
for (let i = 0; i < 128; i++) {
    cc.datas[0][i][0].id = i % 2 == 0 ? "techmine:stone" : "techmine:wood_log";
}
function toArrayBuffer(buffer) {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; i++) {
        view[i] = buffer[i];
    }
    return arrayBuffer;
}
// ====== Connection Event Listener ======
Server.addListener('connection', (con) => {

    con.on('message', (dat, isBinary) => {
        let from = PlayerConnection.has(con) ? PlayerConnection.get(con) : "Unknown";
        if (isBinary) {
            let arrayBuffer = toArrayBuffer(dat);
            let type = dat[0];
            BufferHandler.emit(`${type}`, arrayBuffer, con, from);

        } else {
            // @ts-ignore
            const data = JSON.parse(dat);
            SocketHandler.emit(data.type, data, con, from);
            if (package_debug) console.log("Package Incom", data.type, JSON.stringify(data));
        }
    });
    //ids.push(Math.random() * 0x3ff);
    connections.push(con);
    console.log('Client Connected');
    con.on('close', () => console.log('Client Disconnected'));
    con.on('close', () => {
        let from = PlayerConnection.has(con) ? PlayerConnection.get(con) : "Unknown";
        [...PlayerConnection.keys()].forEach((c) => {
            if (c !== con) {
                c.send(JSON.stringify({
                    type: "PlayerLeave",
                    uuid: from
                }));
            }
        });
        if (Players.has(from)) Players.get(from).remove();
    })
});
