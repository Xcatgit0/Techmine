// ล้าง texture ที่พบใน material โดยอัตโนมัติ
function disposeMaterialTextures(material) {
    // วนผ่าน property ทุกตัวของ material และถ้าเป็น THREE.Texture ให้ dispose()
    for (const key in material) {
        if (!Object.prototype.hasOwnProperty.call(material, key)) continue;
        const value = material[key];
        if (value && typeof value === 'object' && value.isTexture) {
            try { value.dispose(); } catch (e) { /* ignore */ }
        }
    }
}

// dispose material แบบรองรับ array (multi-material)
function disposeMaterial(material) {
    if (!material) return;
    if (Array.isArray(material)) {
        material.forEach(disposeMaterial);
        return;
    }
    // ถ้ามี map/normalMap/roughnessMap/... พวกนี้จะถูกจับโดย disposeMaterialTextures
    disposeMaterialTextures(material);

    // ถ้ามาแบบ onBeforeCompile ฯลฯ อาจมี references อื่น ๆ — ปรับตามต้องการ
    try { material.dispose(); } catch (e) { /* ignore */ }
}

// ล้าง object เดียว (mesh, line, points, sprite)
function disposeObject(obj) {
    // Geometries
    if (obj.geometry) {
        try { obj.geometry.dispose(); } catch (e) { /* ignore */ }
        obj.geometry = undefined;
    }

    // Materials
    if (obj.material) {
        disposeMaterial(obj.material);
        obj.material = undefined;
    }

    // ถ้ามี texture หรือ maps อื่นๆ เก็บไว้ที่ obj (นอก material) เช่น sprite.map
    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        const v = obj[key];
        if (v && typeof v === 'object' && v.isTexture) {
            try { v.dispose(); } catch (e) { /* ignore */ }
            obj[key] = undefined;
        }
    }

    // If SkinnedMesh: free skeleton/bone references (good practice)
    if (obj.isSkinnedMesh) {
        obj.skeleton && (obj.skeleton = null);
    }

    // Remove event listeners stored on userData (ถ้ามี)
    if (obj.userData && obj.userData._listeners) {
        // ตัวอย่าง ถ้าเก็บ listeners เอง ให้ล้าง
        obj.userData._listeners.forEach(fn => {
            try { /* remove fn from whatever emitter */ } catch (e) { }
        });
        delete obj.userData._listeners;
    }
}

// ฟังก์ชันหลัก: ลบ children ทั้งหมดของ group และ dispose ทุกอย่าง
export default function disposeGroup(group, { removeFromParent = true } = {}) {
    if (!group) return;

    // หยุด traverse และเก็บ children ก่อน (เพื่อหลีกเลี่ยง mutation issue)
    const children = [...group.children];

    children.forEach(child => {
        // ถ้ามี child เป็น Group หรือ Object3D ให้ traverse ลงไปก่อนลบ
        child.traverse(obj => {
            // ยกเลิก animation (ถ้ามี requestAnimationFrame id เก็บไว้ใน userData)
            if (obj.userData && obj.userData._rafId) {
                try { cancelAnimationFrame(obj.userData._rafId); } catch (e) { }
                delete obj.userData._rafId;
            }
            // ยกเลิก intervals/timeouts (ถ้าเก็บไว้)
            if (obj.userData && obj.userData._intervalId) {
                try { clearInterval(obj.userData._intervalId); } catch (e) { }
                delete obj.userData._intervalId;
            }
            if (obj.userData && obj.userData._timeoutId) {
                try { clearTimeout(obj.userData._timeoutId); } catch (e) { }
                delete obj.userData._timeoutId;
            }

            // ถ้ามี audio source ให้หยุดแล้ว dispose (ตัวอย่าง)
            if (obj.type === 'Audio' || obj.isAudio) {
                try { obj.stop && obj.stop(); } catch (e) { }
                try { obj.disconnect && obj.disconnect(); } catch (e) { }
            }

            // dispose mesh/geometry/material/textures
            disposeObject(obj);
        });

        // เอา child ออกจาก parent
        try {
            if (removeFromParent && child.parent) child.parent.remove(child);
        } catch (e) { /* ignore */ }
    });
}
