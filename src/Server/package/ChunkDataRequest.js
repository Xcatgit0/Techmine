

export class ChunkDataRequest {
    /**
     * 
     * @param {ChunkDataRequest} data 
     */
    constructor(data) {
        this.type = "ChunkDataRequest";
        this.chunkX = 0;
        this.totalPart = 8;
        this.chunkZ = 0;
        if (data) {
            this.chunkX = data.chunkX;
            this.chunkZ = data.chunkZ;
            this.totalPart = data.totalPart ?? 8;
        }
    }
}