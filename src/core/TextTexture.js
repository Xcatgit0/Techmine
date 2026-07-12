import { CanvasTexture } from "three";
export function createTextTexture(text, parameters = {}) {
    const font = parameters.font || '48px Arial';
    const color = parameters.color || 'white';
    const backgroundColor = parameters.backgroundColor || 'transparent';

    // สร้าง canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    ctx.font = font;

    // กำหนดขนาด canvas ตามข้อความ
    const metrics = ctx.measureText(text);
    canvas.width = metrics.width + 20;
    canvas.height = parseInt(font, 10) * 1.2;

    // วาด background
    if (backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // วาดข้อความ
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.fillText(text, 10, canvas.height * 0.8);

    // สร้าง texture
    const texture = new CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}
