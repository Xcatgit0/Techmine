/**
 * @typedef {Object} BlockTexture
 * @property {string} [all] - ใช้กับทุกด้าน (เช่น type: "all")
 * @property {string} [top] - เท็กซ์เจอร์ด้านบน
 * @property {string} [bottom] - เท็กซ์เจอร์ด้านล่าง
 * @property {string} [front] - เท็กซ์เจอร์ด้านหน้า
 * @property {string} [back] - เท็กซ์เจอร์ด้านหลัง
 * @property {string} [left] - เท็กซ์เจอร์ด้านซ้าย
 * @property {string} [right] - เท็กซ์เจอร์ด้านขวา
 */

/**
 * @typedef {"all" | "TwoSide" | "SixSide"} SideType
 */

/**
 * @typedef {Object} BlockDefinition
 * @property {SideType} type - ประเภทของบล็อกตามด้านที่ใช้
 * @property {BlockTexture} texture - ข้อมูลเท็กซ์เจอร์ของแต่ละด้าน
 */

/**
 * @typedef {Object.<string, BlockDefinition>} BlockMap
 * อ็อบเจกต์ที่แมปชื่อบล็อกกับการตั้งค่าของบล็อกนั้น
 */
const texture = {
    "techmine:default": "block/default.png",
    "techmine:stone": "block/stone.png",
    "techmine:dirt": "block/dirt.png",
    "techmine:wood_log_side": "block/wood_log_side.png",
    "techmine:wood_log_top": "block/wood_log_top.png",
    "techmine:grass_side": "block/grass_side.png",
    "techmine:grass_top": "block/grass_top.png",
    "techmine:glass": "block/glass.png",
    "techmine:leaves": "block/leaves.png"
}
/** @type {BlockMap} */
const blocks = {
    "techmine:default": {
        type: "all",
        texture: { all: "techmine:default" }
    },
    "techmine:stone": {
        type: "all",
        texture: { all: "techmine:stone" }
    },
    "techmine:dirt": {
        type: "all",
        texture: { all: "techmine:dirt" }
    },
    "techmine:wood_log": {
        type: "TwoSide",
        texture: { top: "techmine:wood_log_top", left: "techmine:wood_log_side" }
    },
    "techmine:grass": {
        type: 'SixSide',
        texture: { top: "techmine:grass_top", bottom: "techmine:dirt", left: "techmine:grass_side", right: "techmine:grass_side", back: "techmine:grass_side", front: "techmine:grass_side" }
    },
    "techmine:glass": {
        type: "all",
        texture: { all: "techmine:glass" }
    },
    "techmine:leaves": {
        type: "all",
        texture: { all: "techmine:leaves" }
    }
}
export { texture, blocks };