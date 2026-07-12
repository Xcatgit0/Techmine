
/** @typedef {import("../../core/Chunk").Chunk[][][]}  chunkData*/

export class ChunkDataPart {
    /**
     * 
     * @param {ChunkDataPart} data 
     */
    constructor(data = undefined) {
        this.type = "ChunkDataPart";
        this.chunkX = 0;
        this.chunkZ = 0;
        this.totalPart = 8;
        this.PartIndex = 0;
        this.startY = 0;
        /** @type {chunkData} */
        this.data = []; // slice data 16x16x16
        if (typeof data !== "undefined") {
            this.chunkX = data.chunkX;
            this.chunkZ = data.chunkZ;
            this.totalPart = data.totalPart;
            this.PartIndex = data.PartIndex;
            this.data = data.data;
        }
    }
}