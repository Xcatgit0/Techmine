// กำหนดขนาด chunk
const CHUNK_SIZE = 16;

// ตัวอย่าง block type
function makeBlock(id) {
    return { id, solid: id !== 0 }; // 0 = air
}

// สร้าง Chunk เป็น 3D array ขนาด 16x16x16 พร้อมบล็อก id = 1
function createChunk(cx, cy, cz) {
    const blocks = [];
    for (let x = 0; x < CHUNK_SIZE; x++) {
        blocks[x] = [];
        for (let y = 0; y < CHUNK_SIZE; y++) {
            blocks[x][y] = [];
            for (let z = 0; z < CHUNK_SIZE; z++) {
                blocks[x][y][z] = makeBlock(1); // block id = 1 = solid
            }
        }
    }
    return { cx, cy, cz, blocks };
}

// เก็บ chunks ทั้งหมดแบบง่าย ๆ (ใช้ key string)
const world = {
    chunks: {},

    // เพิ่ม chunk ที่ตำแหน่ง (cx, cy, cz)
    addChunk(chunk) {
        const key = `${chunk.cx},${chunk.cy},${chunk.cz}`;
        this.chunks[key] = chunk;
    },

    // ดึง chunk ตามพิกัด chunk
    getChunk(cx, cy, cz) {
        return this.chunks[`${cx},${cy},${cz}`];
    }
};

// ฟังก์ชันหลัก: ดึง block ที่พิกัด global
function getBlock(globalX, globalY, globalZ) {
    const cx = Math.floor(globalX / CHUNK_SIZE);
    const cy = Math.floor(globalY / CHUNK_SIZE);
    const cz = Math.floor(globalZ / CHUNK_SIZE);

    const chunk = world.getChunk(cx, cy, cz);
    if (!chunk) return null;

    const lx = ((globalX % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const ly = ((globalY % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((globalZ % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

    return chunk.blocks[lx][ly][lz];
}

// ---- DEMO START ----

// สร้าง chunk ที่ตำแหน่ง (0,0,0) และ (1,0,0)
world.addChunk(createChunk(0, 0, 0));
world.addChunk(createChunk(1, 0, 0));

// ลบ block บางก้อนเพื่อดูผลว่าเจอ null หรือไม่
world.chunks["1,0,0"].blocks[0][0][0] = makeBlock(0); // set เป็น air

// ทดสอบการ getBlock
console.log("Block (10,5,5) = ", getBlock(10, 5, 5));         // อยู่ใน chunk (0,0,0)
console.log("Block (20,5,5) = ", getBlock(20, 5, 5));         // อยู่ใน chunk (1,0,0)
console.log("Block (16,0,0) = ", getBlock(16, 0, 0));         // ขอบ chunk (1,0,0), ถูก set เป็น air
console.log("Block (100,0,0) = ", getBlock(100, 0, 0));       // ยังไม่มี chunk → null
console.log("Block (-1,5,5) = ", getBlock(-1, 5, 5));         // ต้องขอ chunk (-1,0,0) → null
