import { createNoise2D } from '../node_modules/simplex-noise/dist/esm/simplex-noise.js';
import { Voxel } from './core/Voxel.js';
import { Chunk } from './core/Chunk.js';
const ran = () => { return 0.4 };
const noise2D = createNoise2D(ran);

const width = 16;
const depth = 16;
const maxHeight = 100;

const BIOMES = {
    "techmine:plains": {
        baseHeight: 50,
        variation: 5,
        surface: "techmine:grass",
        sub: "techmine:dirt",
        deep: "techmine:stone"
    },
    "techmine:beach": {
        baseHeight: 45,
        variation: 3,
        surface: "techmine:sand",
        sub: "techmine:sand",
        deep: "techmine:stone"
    },
    "techmine:forest": {
        baseHeight: 52,
        variation: 7,
        surface: "techmine:grass",
        sub: "techmine:dirt",
        deep: "techmine:stone"
    }
};

function pickBiome(cx, cz) {
    const n = (noise2D(cx / 50, cz / 50) + 1) / 2;
    if (n < 0.3) return "techmine:beach";
    if (n < 0.6) return "techmine:plains";
    return "techmine:forest";
}

export function Generate(chunk, cx, cz, strength = 140) {
    if (chunk.biome === "") {
        chunk.biome = pickBiome(cx, cz);
    }
    const biome = BIOMES[chunk.biome] ?? BIOMES["techmine:plains"];

    const offsetX = cx * width;
    const offsetZ = cz * depth;

    const surfaceBlocks = []; // เก็บตำแหน่ง surface เพื่อตกแต่งทีหลัง

    for (let x = 0; x < width; x++) {
        for (let z = 0; z < depth; z++) {
            const nx = (x + offsetX) / strength;
            const nz = (z + offsetZ) / strength;

            const hNoise = (noise2D(nx, nz) + 1) / 2;
            const heightValue = Math.floor(biome.baseHeight + hNoise * biome.variation);

            for (let y = 0; y < maxHeight; y++) {
                let id = "techmine:air";
                if (y < heightValue - 4) id = biome.deep;
                else if (y < heightValue - 1) id = biome.sub;
                else if (y < heightValue) {
                    id = biome.surface;
                    surfaceBlocks.push({ x, y, z }); // บันทึกจุด surface
                }
                chunk.datas[x][y][z] = new Voxel(id);
            }
        }
    }

    // ตกแต่ง: spawn ต้นไม้ใน forest
    if (chunk.biome === "techmine:forest") {
        for (const pos of surfaceBlocks) {
            // ใช้ noise2D เพื่อตัดสินใจ spawn
            const treeChance = (noise2D((pos.x + offsetX) / 10, (pos.z + offsetZ) / 10) + 1) / 2;
            if (treeChance > 0.90) {
                placeTree(chunk, pos.x, pos.y + 1, pos.z);
            }
        }
    }
}

/**
 * วางต้นไม้ (trunk + leaves)
 */
function placeTree(chunk, x, y, z) {
    const trunkHeight = 4 + Math.floor(Math.random() * 2);

    // trunk
    for (let i = 0; i < trunkHeight; i++) {
        if (y + i < maxHeight) {
            chunk.datas[x][y + i][z] = new Voxel("techmine:wood_log");
        }
    }

    // leaves (ทรงกลมง่าย ๆ)
    const radius = 3;
    for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dz = -radius; dz <= radius; dz++) {
                if (dx * dx + dy * dy + dz * dz <= radius * radius) {
                    const lx = x + dx;
                    const ly = y + trunkHeight - 1 + dy;
                    const lz = z + dz;
                    if (lx >= 0 && lx < width && lz >= 0 && lz < depth && ly < maxHeight) {
                        if (chunk.datas[lx][ly][lz].id === "techmine:air") {
                            chunk.datas[lx][ly][lz] = new Voxel("techmine:leaves");
                        }
                    }
                }
            }
        }
    }
}
