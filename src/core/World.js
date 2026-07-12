import { Chunk } from "./Chunk.js";
import * as three from 'three';
import { Voxel } from "./Voxel.js";
import * as c from './core.js';
const CHUNK_SIZE = 16;
export class World {
    constructor() {
        /** @type {Map<string, Chunk>} */
        this.chunks = new Map();
        // chunk name "x, y"
        this.groups = new three.Group();
        if (typeof window !== "undefined") {
            window.addEventListener("keydown", async (e) => {
                if (e.key == "r" && e.ctrlKey) {
                    await this.reloadAllChunk();
                }
            });
        }
    }
    setChunk(cx, cz, chunk) {
        this.chunks.set(`${cx},${cz}`, chunk);
        return chunk;
    }
    /**
     * 
     * @param {number} chunkX 
     * @param {number} chunkZ
     * @returns {Chunk}
     */
    getChunk(chunkX, chunkZ) {
        return this.chunks.get(`${chunkX},${chunkZ}`) || null;
    }
    /**
     * 
     * @param {number} cX 
     * @param {number} cZ 
     * @returns {Chunk}
     */
    createChunk(cX, cZ) {
        const chunk = new Chunk(cX, cZ, this);
        this.chunks.set(`${cX},${cZ}`, chunk);
        return chunk;
    }
    getBlock = c.Chunk.getBlock
    async renderAllChunk(delay) {
        let chunks = Array.from(this.chunks.values()).filter(c => c.needsUpdate && c.inRenderRange);
        //alert(JSON.stringify(chunks));
        for (let k of chunks) {
            k.render(this.groups);
            await new Promise((res => {
                setTimeout(res, delay ?? 25);
            }));
        }
    }
    async reloadAllChunk(delay) {
        const chunks = [...this.chunks.values()].filter(c => !c.needsUpdate);
        for (let k of chunks) {
            k.unload();
            //k.needsUpdate = true;
            await new Promise((res => {
                setTimeout(res, delay ?? 25);
            }));
            k.needsUpdate = true;
        }
        await this.renderAllChunk(delay);
    }
}
