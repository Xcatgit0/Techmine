import { Voxel } from "./Voxel.js";
import { World } from "./World.js";
import { FaceDirs } from "./FaceDirs.js";
import * as three from 'three';
import * as texture from './TextureIdentifierManager.js';
import { createSelectiveCube, createIndices } from "./VoxelGeometry.js";

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
    if (!chunk) return null;

    const lx = ((globalX % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const ly = globalY; //((globalY % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((globalZ % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
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
    /** @type {number} */
    #cx;
    /** @type {number} */
    #cz
    /**
     * 
     * @param {number} chunkX 
     * @param {number} chunkZ 
     */
    constructor(chunkX, chunkZ,/** @type {World} */ world, size = 16,/** @type {Array<number,Array<number,Array<number,Voxel>>>} */ data = []) {
        this.#cx = chunkX;
        this.#cz = chunkZ;
        this.world = world;
        this.adddTOSCENEN = false;
        // /** @type {Map<string,three.Mesh>} */
        //this.meshs = new Map();
        /** @type {three.Mesh} */
        this.mesh = null;
        /** @type {three.Mesh} */
        this.meshT = null;
        /** @type {Voxel[][][]} */
        this.datas = [];
        if (this.datas.length === 0) {
            this.datas = [];
            for (let x = 0; x < 16; x++) {
                this.datas[x] = [];
                for (let y = 0; y < 128; y++) {
                    this.datas[x][y] = [];
                    for (let z = 0; z < 16; z++) {
                        this.datas[x][y][z] = new Voxel('techmine:air');
                    }
                }
            }

        }
    }
    render(s) {
        const size = 16;
        let ddd = 0;
        let positions = [];
        //let indices = [];
        let uvs = [];
        let indices = [];
        let vertexOffset = 0;
        function _render(_this, i, j, k) {
            ddd++;
            //if (this.datas[i][j][k].id === 'techmine:air') continue;
            // St0ne block
            //console.log(i, j, k);
            //document.getElementById('count').innerText += `I${i} J${j} K${k} .`;
            const gX = _this.#cx * size + i;
            const gY = j;
            const gZ = _this.#cz * size + k;
            let dirs = [];
            const thisBlock = getBlock(gX, gY, gZ, 16, _this.world);
            for (const _K in FaceDirs) {
                /** @type {{dx: number, dy: number, dz: number}} */
                const value = FaceDirs[_K];
                let block = getBlock(gX + value.dx, gY + value.dy, gZ + value.dz, 16, _this.world);
                let solid = block !== null ? block.isTransparent() : true;
                if (solid) {
                    dirs.push(_K);

                }
            }
            //console.log(i);
            if (_this.datas[i][j][k].id === 'techmine:air') dirs = [];
            if (dirs.length === 0) return;
            //console.log(JSON.stringify(uv));
            dirs.forEach((_K) => {
                const uv = texture.getUVfromName(thisBlock.id, _K);
                uvs.push(...uv);
            })
            // @ts-ignore
            let pni = createIndices(dirs);
            if (thisBlock !== null) if (thisBlock.isTransparent()) pni = createIndices([]);
            for (let x = 0; x < pni.positions.length; x += 3) {
                positions.push(
                    pni.positions[x + 0] + i,
                    pni.positions[x + 1] + j,
                    pni.positions[x + 2] + k
                );
            }

            const adjustedIndices = pni.indices.map(i => i + vertexOffset);
            if (i < 8) {
                indices.push(...adjustedIndices);
            } else {
                indices.push(...adjustedIndices);
            }
            vertexOffset += pni.positions.length / 3;
        }
        for (let x = 0; x < 8; x++) {

            for (let z = 0; z < 8; z++) {

                for (let y = 0; y < 16; y++) {
                    _render(this, x, y, z);
                }

                for (let y = 16; y < 32; y++) {
                    _render(this, x, y, z);
                }

                for (let y = 32; y < 64; y++) {
                    _render(this, x, y, z);
                }
                for (let y = 64; y < 96; y++) {
                    _render(this, x, y, z);
                }
                for (let y = 96; y < 128; y++) {
                    _render(this, x, y, z);
                }
            }

            for (let z = 8; z < 16; z++) {

                for (let y = 0; y < 16; y++) {
                    _render(this, x, y, z);
                }

                for (let y = 16; y < 32; y++) {
                    _render(this, x, y, z);
                }

                for (let y = 32; y < 64; y++) {
                    _render(this, x, y, z);
                }
                for (let y = 64; y < 96; y++) {
                    _render(this, x, y, z);
                }
                for (let y = 96; y < 128; y++) {
                    _render(this, x, y, z);
                }

            }
        }

        const geometry = new three.BufferGeometry();
        geometry.setAttribute('position', new three.Float32BufferAttribute(positions, 3));
        // @ts-ignore
        geometry.setAttribute('uv', new three.Float32BufferAttribute(uvs.flat(), 2));
        const allIndice = [...indices, ...indices];
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        const material = new three.MeshStandardMaterial({
            map: texture.getAtlasTexture(),
            //color: 0xff2323,
            wireframe: false
        });
        const mesh = new three.Mesh(geometry, material);
        mesh.position.set(this.#cx * 16, 0, this.#cz * 16);
        if (this.mesh) this.mesh.geometry.dispose();
        if (!this.mesh) this.mesh = mesh;
        this.mesh.geometry = geometry;
        this.mesh.material = material;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        console.log(geometry.getIndex().count / 3, geometry.attributes.uv.count / 2);
        positions = [];
        uvs = [];
        indices = [];
        vertexOffset = 0;
        //alert(uvs.length / 2 === positions.length / 3);
        //alert(`${uvs.length / 2} , ${indices.length / 2}`);
        for (let x = 8; x < 16; x++) {
            //alert('....')
            for (let z = 0; z < 8; z++) {

                for (let y = 0; y < 16; y++) {
                    _render(this, x, y, z);
                }

                for (let y = 16; y < 32; y++) {
                    _render(this, x, y, z);
                }

                for (let y = 32; y < 64; y++) {
                    _render(this, x, y, z);
                }
                for (let y = 64; y < 96; y++) {
                    _render(this, x, y, z);
                }
                for (let y = 96; y < 128; y++) {
                    _render(this, x, y, z);
                }
            }

            for (let z = 8; z < 16; z++) {


                for (let y = 0; y < 16; y++) {
                    _render(this, x, y, z);
                }

                for (let y = 16; y < 32; y++) {
                    _render(this, x, y, z);
                }

                for (let y = 32; y < 64; y++) {
                    _render(this, x, y, z);
                }
                for (let y = 64; y < 96; y++) {
                    _render(this, x, y, z);
                }
                for (let y = 96; y < 128; y++) {
                    _render(this, x, y, z);
                }
            }
        }
        {
            const geometry = new three.BufferGeometry();
            geometry.setAttribute('position', new three.Float32BufferAttribute(positions, 3));
            // @ts-ignore
            geometry.setAttribute('uv', new three.Float32BufferAttribute(uvs.flat(), 2));
            const allIndice = [...indices, ...indices];
            geometry.setIndex(indices);
            geometry.computeVertexNormals();
            const mesh = new three.Mesh(geometry, material);
            mesh.position.set(this.#cx * 16, 0, this.#cz * 16);
            if (this.meshT) this.meshT.geometry.dispose();
            if (!this.meshT) this.meshT = mesh;
            this.meshT.geometry = geometry;
            this.meshT.material = material;
            this.meshT = mesh;
            this.meshT.castShadow = true;
            this.meshT.receiveShadow = true;
            console.log(geometry.getIndex().count / 3, geometry.attributes.uv.count / 2);
        }
        if (!this.adddTOSCENEN) {
            this.addToScene(s);
        }
    }
    /**
     * 
     * @param {*} scene 
     */
    addToScene(scene) {
        this.adddTOSCENEN = true;
        scene.add(this.mesh);
        scene.add(this.meshT);
    }

}
let chunkY = 128;
export { Chunk, getBlock, chunkY };
