export class Voxel {
    constructor(id = "techmine:air") {
        this.id = id;
    }

    isTransparent() {
        return this.id === "techmine:air" || this.id === "techmine:water";
    }

    isSolid() {
        return !this.isTransparent();
    }
}
