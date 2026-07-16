const schema = {};
function getSchema(name) {
    if (schema.hasOwnProperty(name)) {
        return schema[name];
    } else {
        return false;
    }
}
let readonlySchema = [];
function setSchema(schema_, name, readonly = false) {
    if (readonlySchema.indexOf(name) !== -1) return false;
    schema[name] = schema_;
    if (!readonly) return true;
    readonlySchema.push(name);
    return true;
}
// ตัวอย่าง Schema-based Binary Encoder/Decoder
const TypeInfo_NoUsing = {
    uint8: { size: 1, setter: 'setUint8', getter: 'getUint8' },
    int8: { size: 1, setter: 'setInt8', getter: 'getInt8' },
    uint16: { size: 2, setter: 'setUint16', getter: 'getUint16' },
    int16: { size: 2, setter: 'setInt16', getter: 'getInt16' },
    uint32: { size: 4, setter: 'setUint32', getter: 'getUint32' },
    int32: { size: 4, setter: 'setInt32', getter: 'getInt32' },
    float32: { size: 4, setter: 'setFloat32', getter: 'getFloat32' },
    float64: { size: 8, setter: 'setFloat64', getter: 'getFloat64' }
};
const PlayerPositionSchema = [
    { name: "id", type: "uint8", value: 0 }, // 1
    { name: "x", type: "float32" },          // 5
    { name: "y", type: "float32" },          // 9
    { name: "z", type: "float32" },          // 13
    { name: "timestamp", type: "uint32" },   // 17
    { name: "camX", type: "int16" },          // 18
    { name: "camY", type: "int16" },          // 19 bytes
    { name: "hash", type: "uint32"}          // 23 bytes
]
setSchema(PlayerPositionSchema, "PlayerPosition", true);
export { getSchema, setSchema };
