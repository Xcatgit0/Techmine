function hash(str) {
    let h = 0x811c9dc5;

    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }

    return h >>> 0; // แปลงเป็น uint32
}
export {hash}
