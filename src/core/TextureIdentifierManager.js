import * as three from 'three';
import { blocks, texture } from "./TextureRegistry.js";

const AtlasSize = 1024;
const AtlasTextureSize = 32;
const loaded = {};
let canvas;
let context;
if (typeof process == 'undefined') {
    canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    context = canvas.getContext('2d', { alpha: true });
    context.fillStyle = "rgba(0,0,0,0)";
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    console.log("Texture canvas context created");
}
let TexturePathPrefix = "texturepack/Default/";
function loadImage(src) {
    //alert(src);
    return new Promise((resolve, reject) => {
        const Img = new Image();
        console.log("Loading Image: " + src + " with Prefix path: " + TexturePathPrefix);
        Img.onload = () => resolve(Img);
        Img.onerror = (err) => { console.error(err); reject(err) };
        Img.src = TexturePathPrefix + src;
    });
}
//image = loadImage('/texturepack/Default/block/default.png');


async function loadTex() {
    let x = 0;
    let y = 0;
    for (const i in texture) {
        if (true) {
            if (x === 31) { x = 0; y++; };
            const image = await loadImage(texture[i]);
            //console.log(image);
            loaded[i] = {
                image,
                x,
                y
            };
            //console.log(loaded[i].image);
            //console.log(texture[i]);
            x++;
        }
    }
    //console.log(JSON.stringify(loaded, undefined, 2));
    //alert('Load finsish');
}
let mat;
function getAtlasTexture() {
    //loadTex();
    if (typeof window == "undefined") return;
    //context.fillStyle = 'lightgrey';
    //context.fillRect(0, 0, 1024, 1024);
    //document.body.appendChild(canvas);
    let x = 0;
    let y = 0;
    //console.log(JSON.stringify(loaded, undefined, 2), 'atlas');
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
    if (mat instanceof three.CanvasTexture) {
        mat.dispose();
    }
    mat = new three.CanvasTexture(canvas);
    mat.minFilter = three.NearestFilter;
    mat.magFilter = 1003;
    mat.format = three.RGBAFormat;
    mat.needsUpdate = true;
    mat.wrapS = three.ClampToEdgeWrapping;
    mat.wrapT = three.ClampToEdgeWrapping;
    mat.needsUpdate = true;
    return mat;
}
function reload() {
    if (typeof window == "undefined") return;
    context.fillStyle = 'rgba(0,0,0,0)';
    context.fillRect(0, 0, 1024, 1024);
    //document.body.appendChild(canvas);
    let x = 0;
    let y = 0;
    //console.log(JSON.stringify(loaded, undefined, 2), 'atlas');
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
    mat = new three.CanvasTexture(canvas);
    mat.minFilter = three.NearestFilter;
    mat.magFilter = 1003;
    mat.wrapS = three.ClampToEdgeWrapping;
    mat.wrapT = three.ClampToEdgeWrapping;
    mat.needsUpdate = true;
    return mat;
}
setTimeout(reload, 5_000);
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
    let v0 = 1 - (tileY + 1) * tileHeight // y เริ่มจากบน
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
