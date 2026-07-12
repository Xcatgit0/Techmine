import { Voxel } from "./Voxel.js";
import { World } from "./World.js";
import { FaceDirs } from "./FaceDirs.js";
import * as three from 'three';
import { checkFaceCulling } from "./FaceCullingRules.js";
import * as textur from './TextureIdentifierManager.js';
import { createSelectiveCube, createIndices } from "./VoxelGeometry.js";
let texture = { ...textur };
if (typeof process !== 'undefined') {
    for (let i in texture) {
        texture[i] = (typeof texture[i] !== "function") ? ((typeof texture[i] === "string") ? "" : 0) : () => { }
    }
}
function getFaceUVTemplate(direction, uv) {
    const baseUV = {
        bl: [uv[0], uv[1]],
        br: [uv[2], uv[3]],
        tl: [uv[4], uv[5]],
        tr: [uv[6], uv[7]]
    }
    const { bl, br, tl, tr } = baseUV;

    switch (direction) {
        case 'Z+': // ด้านหน้า
            return [
                ...bl,  // bottom-left
                ...br,  // bottom-right
                ...tl,  // top-left
                ...tr   // top-right
            ];

        case 'Z-': // ด้านหลัง (mirror)
            return [
                ...br,
                ...bl,
                ...tr,
                ...tl
            ];

        case 'X+': // ด้านขวา
            return [
                ...bl,
                ...br,
                ...tl,
                ...tr
            ];

        case 'X-': // ด้านซ้าย (mirror)
            return [
                ...br,
                ...bl,
                ...tr,
                ...tl
            ];

        case 'Y+': // ด้านบน (แนวตั้ง, อาจต้องหมุน)
            return [
                ...tl,
                ...tr,
                ...bl,
                ...br
            ];

        case 'Y-': // ด้านล่าง (กลับด้าน)
            return [
                ...bl,
                ...br,
                ...tl,
                ...tr
            ];

        default:
            throw new Error('Unknown face direction: ' + direction);
    }
}


/**
 * 
 * @param {number} globalX 
 * @param {number} globalY 
 * @param {number} globalZ 
 * @param {number} CHUNK_SIZE 
 * @param {World} world 
 * @returns {Voxel}
 */
function getBlock(globalX, globalY, globalZ, CHUNK_SIZE, world) {
    const cx = Math.floor(globalX / CHUNK_SIZE);
    //const cy = Math.floor(globalY / CHUNK_SIZE);
    const cz = Math.floor(globalZ / CHUNK_SIZE);

    const chunk = world.getChunk(cx, cz);
    if (!chunk) return new Voxel('techmine:air');

    const lx = ((globalX % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const ly = Math.floor(globalY); //((globalY % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((globalZ % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    //console.log(lx, ly, lz);
    return (!(ly < 0 || ly >= 128)) ? chunk.datas[lx][ly][lz] : new Voxel('techmine:air');
}

function debugPositionsWithAxes(scene, positions, size = 0.2) {
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];

        const helper = new three.AxesHelper(size);
        helper.position.set(x, y, z);
        scene.add(helper);
    }
}
class Chunk {
    constructor(chunkX, chunkZ, world, size = 16, data = []) {
        this.cx = chunkX;
        this.cz = chunkZ;
        this.inRenderRange = true;
        this.world = world;
        this.size = size;
        this.modifiedChunk = false;
        /** @type {three.Mesh} */
        this.mesh = null;
        this.needsUpdateServer = true;
        this.needsUpdate = true; // จะสร้าง mesh ใหม่เฉพาะเมื่อ true
        /** @type {Voxel[][][]} */
        this.datas = data.length ? data : this.createEmptyData(size, 128);
        this.biome = "";
    }
    /**
     * 
     * @returns {any[][][]}
     */
    serialize() {
        let arr = [];
        for (let x = 0; x < this.size; x++) {
            arr[x] = [];
            for (let y = 0; y < 128; y++) {
                arr[x][y] = [];
                for (let z = 0; z < this.size; z++) {
                    // @ts-ignore
                    arr[x][y][z] = this.datas[x][y][z].serialize();
                }
            }
        }
        return arr;
    }
    deserialize(a) {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < 128; y++) {
                for (let z = 0; z < this.size; z++) {
                    // @ts-ignore
                    this.datas[x][y][z].deserialize(a[x][y][z]);
                }
            }
        }
    }
    unload() {
        //this.mesh.rotation.y = -Math.PI / 3;
        if (this.mesh) {
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            // @ts-ignore
            if (this.mesh.material) this.mesh.material.dispose();
        }
        this.world.groups.remove(this.mesh);
        this.mesh = null;
        this.needsUpdate = false;
    }
    createEmptyData(size, height) {
        const arr = [];
        for (let x = 0; x < size; x++) {
            arr[x] = [];
            for (let y = 0; y < height; y++) {
                arr[x][y] = [];
                for (let z = 0; z < size; z++) {
                    // @ts-ignore
                    arr[x][y][z] = new Voxel('techmine:air');
                }
            }
        }
        return arr;
    }


    buildMesh() {
        const size = this.size;
        const positions = [];
        const uvs = [];
        const indices = [];
        let vertexOffset = 0;

        for (let x = 0; x < size; x++) {
            for (let y = 0; y < 128; y++) {
                for (let z = 0; z < size; z++) {
                    const block = this.datas[x][y][z];
                    if (block.id === 'techmine:air') continue;

                    const gX = this.cx * size + x;
                    const gY = y;
                    const gZ = this.cz * size + z;

                    // ตรวจสอบเพื่อนบ้านว่าหน้าด้านไหนต้อง render
                    const dirs = [];
                    for (const dir in FaceDirs) {
                        const { dx, dy, dz } = FaceDirs[dir];
                        const neighbor = getBlock(gX + dx, gY + dy, gZ + dz, 16, this.world);
                        const needToCulling = checkFaceCulling(block, neighbor);
                        if (!needToCulling) dirs.push(dir);
                    }

                    if (dirs.length === 0) continue;

                    // UV
                    dirs.forEach(dir => {
                        const uv = texture.getUVfromName(block.id, dir);
                        uvs.push(...uv);
                    });

                    // Geometry data
                    let pni = createIndices(dirs);
                    //if (block.isTransparent()) pni = createIndices([]);

                    for (let i = 0; i < pni.positions.length; i += 3) {
                        positions.push(
                            pni.positions[i] + x,
                            pni.positions[i + 1] + y,
                            pni.positions[i + 2] + z
                        );
                    }

                    const adjustedIndices = pni.indices.map(i => i + vertexOffset);
                    indices.push(...adjustedIndices);

                    vertexOffset += pni.positions.length / 3;
                }
            }
        }

        // สร้าง BufferGeometry ครั้งเดียว
        const geometry = new three.BufferGeometry();
        geometry.setAttribute('position', new three.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('uv', new three.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        if (!this.mesh) {
            this.mesh = new three.Mesh(geometry, sharedMaterial);
            this.mesh.position.set(this.cx * size, 0, this.cz * size);
        } else {
            this.mesh.geometry.dispose();
            this.mesh.geometry = geometry;
        }

        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.needsUpdate = false;
    }

    render(scene) {
        if (this.needsUpdate) {
            this.buildMesh();
            scene.add(this.mesh);
        }
    }
}

const tex = texture.getAtlasTexture();
// ใช้ Material เดียวกันทั้งโลก
let sharedMaterial = new three.MeshStandardMaterial({
    map: tex,
    transparent: true
});
sharedMaterial.needsUpdate = true;
setTimeout(() => {
    if (typeof window != "undefined") tex.dispose();
    sharedMaterial.dispose();
    sharedMaterial = new three.MeshStandardMaterial({
        map: texture.getAtlasTexture(),
        transparent: true,
        alphaTest: 0.5
    });
    sharedMaterial.needsUpdate = true;
}, 6_000);
let chunkY = 128;
export { Chunk, getBlock, chunkY };
