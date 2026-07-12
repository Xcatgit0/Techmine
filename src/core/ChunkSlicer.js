import { Chunk } from "./Chunk.js";
import { Voxel } from "./core.js";
/**
 * 
 * @param {Chunk} chunk
 * @param {Number} startY 
 * @param {Number} endY 
 */
export function SliceChunk(chunk, startY, endY, serialize) {
    /** @type {Voxel.Voxel[][][]} */
    let arr = [];
    let sliceHeight = endY - startY;
    //console.log(startY, endY);
    for (let x = 0; x < 16; x++) {
        arr[x] = [];
        for (let yy = 0; yy < sliceHeight; yy++) {
            let y = startY + yy; // แปลง index ของ chunk → index ของ slice
            arr[x][yy] = [];
            for (let z = 0; z < 16; z++) {

                //sconsole.log(y);
                // @ts-ignore
                arr[x][yy][z] = chunk.datas[x][y][z];
            }
        }
    }
    if (serialize) {
        let ar = [];
        arr.forEach((x, xi) => {
            ar[xi] = [];
            x.forEach((y, yi) => {
                ar[xi][yi] = [];
                y.forEach((z, zi) => {
                    //if (z.id !== "techmine:air") console.log("ff");
                    // @ts-ignore
                    ar[xi][yi][zi] = z.serialize();
                    //console.log(ar[xi][yi][zi].id);
                });
            });
        });
        return ar;
    }
    return arr;
}
/**
 * Write sliced layers back into chunk.datas
 * 
 * @param {Chunk} chunk 
 * @param {number} startY 
 * @param {any[][][]} layers  // layers[x][yy][z]
 */
export function WriteSliceToChunk(chunk, startY, layers, serialize) {
    for (let yy = 0; yy < layers[0]?.length; yy++) {
        let y = startY + yy; // คำนวณตำแหน่งจริงใน chunk
        for (let x = 0; x < 16; x++) {
            for (let z = 0; z < 16; z++) {
                if (!serialize) {
                    chunk.datas[x][y][z] = layers[x][yy][z];
                    continue;
                }
                //console.log(layers[x][yy][z].id);
                chunk.datas[x][y][z].deserialize(layers[x][yy][z]);
                //chunk.datas[x][y][z].deserialize({ id: 1 });
                //if (layers[x][yy][z].id !== 0) alert("other block");
            }
        }
    }
    chunk.datas[5][5][5].id = "techmine:stone";
    return chunk;
}
