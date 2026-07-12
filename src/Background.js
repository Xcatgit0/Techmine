// สร้างพื้นหลังแบบ 
import * as THREE from 'three';
/**
 * 
 * @param {THREE.Scene} scene 
 * @returns 
 */
export default function createGradientBackground(scene) {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 256;

  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, '#87CEEB');  // สีฟ้าอ่อนด้านบน
  gradient.addColorStop(1, '#E0F6FF');  // สีขาวฟ้าอ่อนด้านล่าง

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 16, 256);

  const texture = new THREE.CanvasTexture(canvas);
  const skyGeo = new THREE.SphereGeometry(500, 32, 32);
  const skyMat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);
  return function () {
    skyGeo.dispose();
    skyMat.dispose();
    texture.dispose();
    scene.remove(sky);
  }
}
