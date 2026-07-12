// ตัวอย่าง Schema-based Binary Encoder/Decoder
const typeInfo = {
    uint8: { size: 1, setter: 'setUint8', getter: 'getUint8' },
    int8: { size: 1, setter: 'setInt8', getter: 'getInt8' },
    uint16: { size: 2, setter: 'setUint16', getter: 'getUint16' },
    int16: { size: 2, setter: 'setInt16', getter: 'getInt16' },
    uint32: { size: 4, setter: 'setUint32', getter: 'getUint32' },
    int32: { size: 4, setter: 'setInt32', getter: 'getInt32' },
    float32: { size: 4, setter: 'setFloat32', getter: 'getFloat32' },
    float64: { size: 8, setter: 'setFloat64', getter: 'getFloat64' }
};

function calcSchemaSize(schema) {
    return schema.reduce((sum, s) => sum + typeInfo[s.type].size, 0);
}

function encode(obj, schema) {
    const buffer = new ArrayBuffer(calcSchemaSize(schema));
    const dv = new DataView(buffer);
    let offset = 0;
    for (const s of schema) {
        const info = typeInfo[s.type];
        let value = obj[s.name];
        if (typeof s.value !== "undefined") value = s.value;
        if (s.scale) value = Math.round(value / s.scale);
        dv[info.setter](offset, value, true);
        offset += info.size;
    }
    return buffer;
}

function decode(buffer, schema) {
    const dv = new DataView(buffer);
    let offset = 0;
    const obj = {};
    for (const s of schema) {
        const info = typeInfo[s.type];
        let value = dv[info.getter](offset, true);
        if (s.scale) value = value * s.scale;
        obj[s.name] = value;
        offset += info.size;
    }
    return obj;
}
export { encode, decode };
