import * as three from 'three';

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
    "techmine:wood_log_top": "block/wood_log_top.png"
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
    }
}
const AtlasSize = 1024;
const AtlasTextureSize = 32;
const loaded = {};
const canvas = document.createElement('canvas');
canvas.width = 1024;
canvas.height = 1024;
const context = canvas.getContext('2d');
let TexturePathPrefix = "texturepack/Default/";
function loadImage(src) {
    //alert(src);
    return new Promise((resolve) => {
        const Img = new Image();
        Img.src = TexturePathPrefix + src;
        Img.onload = () => resolve(Img);
    });
}
//const image = loadImage('/texturepack/Default/block/default.png');
for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 32; j++) {
        loaded[i] = {
            image: null,
            i,
            j
        }
    }
}
async function loadTex() {
    let x = 0;
    let y = 0;
    for (const i in texture) {
        if (true) {
            if (x === 31) { x = 0; y++; };
            const image = await loadImage(texture[i]);
            loaded[i] = {
                image,
                x,
                y
            };
            x++;
        }
    }
    //alert('Load finsish');
}
function getAtlasTexture() {

    context.fillStyle = 'lightgrey';
    context.fillRect(0, 0, 1024, 1024);
    //document.body.appendChild(canvas);
    let x = 0;
    let y = 0;
    for (const k in loaded) {
        //alert(k);
        if (loaded[k].x === 31) {
            x = 0;
            y += 32;
            continue;
        }
        //console.log(x, y);
        if (loaded[k].image) {
            context.drawImage(loaded[k].image, x, y, 32, 32);
            x += 32;
        }

    }
    let mat = new three.CanvasTexture(canvas);
    mat.minFilter = three.NearestFilter;
    mat.magFilter = 1003;
    mat.wrapS = three.ClampToEdgeWrapping;
    mat.wrapT = three.ClampToEdgeWrapping;
    return mat;
}
/**
 * 
 * @param {number} tileX 
 * @param {number} tileY 
 * @param {number} tileCountX 
 * @param {number} tileCountY 
 * @returns 
 */
function getUVFromTile(tileX, tileY, tileCountX, tileCountY) {
    const tileWidth = 1 / tileCountX;
    const tileHeight = 1 / tileCountY;
    const margin = 1 / 1024;
    let u0 = tileX * tileWidth;
    let v0 = 1 - (tileY + 1) * tileHeight; // y เริ่มจากบน
    let u1 = u0 + tileWidth;
    let v1 = v0 + tileHeight;
    u0 += margin; v0 += margin; u1 -= margin; v1 -= margin;
    return [
        u0, v0,  // bottom-left
        u1, v0,  // bottom-right
        u0, v1,  // top-left
        u1, v1   // top-right
    ];
}
const sideXYZtoATBFBLR = {
    "X-": "left",
    "X+": "right",
    "Y+": "top",
    "Y-": "bottom",
    "Z-": "front",
    "Z+": "back"
}
const XYZtoATBFBLR = {
    "X-": "left",
    "X+": "left",
    "Y+": "top",
    "Y-": "top",
    "Z-": "left",
    "Z+": "left"
}
function getUVfromName(name, side) {

    if (side) {
        let block = (blocks[name]) ? blocks[name] : blocks['techmine:default'];
        switch (block.type) {
            case 'all':
                return getUVfromName(block.texture.all);
            case 'TwoSide':
                block.texture.left = (block.texture.left !== undefined) ? block.texture.left : block.texture.right;
                //console.log(block.texture[XYZtoATBFBLR[side]]);
                return getUVfromName(block.texture[XYZtoATBFBLR[side]]);
            case 'SixSide':
                return getUVfromName(block.texture[sideXYZtoATBFBLR[side]]);
        }
    } else {
        let tex = loaded[name];
        if (tex) {
            var uvs = getUVFromTile(tex.x, tex.y, 32, 32);
        } else {
            var uvs = getUVFromTile(0, 0, 32, 32);
        }
        return uvs ?? getUVFromTile(0, 0, 32, 32);
    }

}
export { getUVFromTile, getUVfromName, loadTex, getAtlasTexture }
