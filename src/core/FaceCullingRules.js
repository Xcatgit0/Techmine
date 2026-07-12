import { Voxel } from "./Voxel.js";

let TransparentFaceCullingRules = {
    "techmine:leaves": "techmine:leaves",
}
let NoCullingFaceRules = {

}
/**
 * 
 * @param {Voxel} a 
 * @param {Voxel} b 
 * @returns 
 */
export function checkFaceCulling(a, b) {
    if (a.id in TransparentFaceCullingRules) {
        if (b.id === TransparentFaceCullingRules[a.id]) {
            return true;
        }
        return false;
    }
    if (a.id in NoCullingFaceRules || b.id in NoCullingFaceRules) return false;
    return !b.isTransparent();
}