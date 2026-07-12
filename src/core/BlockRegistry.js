let Block = new Set([
    "techmine:air",
    "techmine:stone",
    "techmine:dirt",
    "techmine:grass",
    "techmine:wood_log",
    "techmine:default",
    "techmine:leaves",
    "techmine:sand"
]);
/** @type {Map<string,number>} */
let idVoxel = new Map();
let array = [...Block.keys()];
array.forEach((n, i) => {
    idVoxel.set(n, i);
});
/** @type {Map<number,string>} */
let VoxelId = new Map();
function setInvertMap(st, nd) {
    for (let key of st.keys()) {
        nd.set(st.get(key), key);
    }
}
setInvertMap(idVoxel, VoxelId);
console.log(idVoxel, VoxelId);



export { idVoxel, VoxelId };