import { VoxelId, idVoxel } from './BlockRegistry.js';
export class Voxel {
    constructor(id = "techmine:air") {
        this.id = id;
        ////this.tags = [];===
    }

    isTransparent() {
        return this.id === "techmine:air" || this.id === "techmine:water" || this.id === "techmine:glass" || this.id === "techmine:leaves";
    }

    isSolid() {
        return !this.isTransparent();
    }
    serialize() {
        if (!idVoxel.has(this.id)) console.log(this.id + " was no serialization key in idVoxel");
        return {
            id: (idVoxel.has(this.id)) ? idVoxel.get(this.id) : idVoxel.get("techmine:default")
        }
    }
    deserialize(obj) {
        //console.log(`${this.id} => ${(VoxelId.has(obj.id)) ? VoxelId.get(obj.id) : VoxelId.get(5)}`);
        this.id = VoxelId.get(obj.id);
        //if (this.id === "techmine:stone") console.log("stone");
    }
}
