import { createNoise2D } from '../node_modules/simplex-noise/dist/esm/simplex-noise.js';
import { Voxel } from './core/Voxel.js';
import { Chunk } from './core/Chunk.js';
const noise2D = createNoise2D(); // ????????? seed ?????

const width = 16;
const depth = 16;
const maxHeight = 50;
/**
 * 
 * @param {Chunk} chunk 
 */
export function Generate(chunk, cx, cz, strength = 30) {
    // ????? terrain ??????????
    const offsetX = cx * 16;
    const offsetZ = cz * 16
    for (let x = 0 + offsetX; x < width + offsetX; x++) {
        for (let z = 0 + offsetZ; z < depth + offsetZ; z++) {
            const nx = x / strength;
            const nz = z / strength;

            // ????????????? noise
            const heightValue = Math.floor((noise2D(nx, nz) + 1) / 2 * maxHeight);

            for (let y = 0; y < maxHeight; y++) {
                let id = "techmine:air";

                if (y < heightValue - 4) id = "techmine:stone";
                else if (y < heightValue - 1) id = "techmine:dirt";
                else if (y < heightValue) id = "techmine:dirt";

                // ??? voxel
                chunk.datas[x - offsetX][y][z - offsetZ] = new Voxel(id);
            }
        }
    }
}