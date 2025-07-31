import { Chunk } from "./Chunk.js";
import * as three from 'three';
export class World {
    constructor() {
        /** @type {Map<string, Chunk>} */
        this.chunks = new Map();
        // chunk name "x, y"
        this.groups = new three.Group();
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
    async renderAllChunk() {
        let chunks = Array.from(this.chunks.keys());
        //alert(JSON.stringify(chunks));
        for (let k of chunks) {
            this.chunks.get(k).render(this.groups);
            await new Promise((res => {
                setTimeout(res, 25);
            }));
        }
    }
}