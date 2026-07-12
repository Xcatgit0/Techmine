import * as core from './core.js';
import { Generate } from '../SimpleWorldGeneration.js';
import * as three from 'three';
import { EventEmitter } from '../EventEmitter.js';
export class WorldLoader2D {
    /**
     * 
     * @param {core.World.World} world 
     * @param {three.Mesh} player 
     * @param {EventEmitter} ev 
     */
    constructor(world, player, ev, getchunk, con, log) {
        this.ev = ev;
        this.con = con;
        this.log = log;
        this.getchunk = getchunk;
        this.world = world;         // object world ของคุณ
        this.player = player;       // player object
        this.chunkSize = 16;
        this.loadRadius = 2;
        this.unloadRadius = this.loadRadius;      // ถัดจาก load radius จะ unload
        window.addEventListener("keydown", (e) => {
            if (e.key == "m" && e.ctrlKey) {
                this.loadRadius = parseInt(prompt("Enter new a chunk load raduis number")) ?? 1;
                this.unloadRadius = this.loadRadius;
            }
        });
    }

    getChunkCoords(position) {
        return {
            x: Math.floor(position.x / this.chunkSize),
            z: Math.floor(position.z / this.chunkSize)
        };
    }
    async update() {
        if (!this.player?.position) return;
        const playerChunk = this.getChunkCoords(this.player?.position);

        // สร้างลิสต์ offsets รอบผู้เล่นเป็นวงกลม
        const offsets = [];
        for (let dx = -this.loadRadius; dx <= this.loadRadius; dx++) {
            for (let dz = -this.loadRadius; dz <= this.loadRadius; dz++) {
                if (dx * dx + dz * dz <= this.loadRadius * this.loadRadius) {
                    offsets.push({ dx, dz });
                }
            }
        }

        // โหลดชั้งที่ยังไม่มีหรือ needsUpdateServer
        for (const { dx, dz } of offsets) {
            const cx = playerChunk.x + dx;
            const cz = playerChunk.z + dz;

            let chunk = this.world.getChunk(cx, cz);
            if (chunk) chunk.inRenderRange = true;
            // ถ้าไม่มีชั้งหรือ needsUpdateServer = true ให้โหลดใหม่
            if (!chunk || chunk.needsUpdateServer) {
                chunk = await this.getchunk(cx, cz);
                //this.log("newly Chunk loaded", chunk.cx, chunk.cz, 500)
                chunk.needsUpdate = true;
                chunk.needsUpdateServer = false;
                this.world.setChunk(cx, cz, chunk);
                chunk.render(this.world.groups);
            } else {
                if (!chunk.mesh) {
                    chunk.needsUpdate = true;
                    //chunk.render(this.world.groups);
                }
            }
        }
        this.world.renderAllChunk(100);
        // Unload ชั้งที่อยู่นอก unloadRadius
        const unloadRadiusSq = this.unloadRadius * this.unloadRadius;
        const chunksToUnload = [];

        for (const chunk of this.world.chunks.values()) {
            const { cx: cx, cz: cz } = chunk;
            const dx = cx - playerChunk.x;
            const dz = cz - playerChunk.z;
            if (dx * dx + dz * dz > unloadRadiusSq) {
                chunksToUnload.push({ cx, cz });
            }
        }

        for (const { cx, cz } of chunksToUnload) {
            let c = this.world.getChunk(cx, cz);
            if (c?.inRenderRange === false) continue;
            c?.unload();
            c.inRenderRange = false;
        }
        //await this.world.renderAllChunk();
    }

}
