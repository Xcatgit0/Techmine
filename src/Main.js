// @ts-check
import * as three from 'three';
import { createSelectiveCube } from './core/VoxelGeometry.js';
import * as core from './core/core.js';
import * as stat from '../stats.module.js';
import { FaceDirs } from './core/FaceDirs.js';
import { Player } from './player.js';
import { Generate } from './SimpleWorldGeneration.js';
import * as texture from './core/TextureIdentifierManager.js'
import { OrbitControls } from '.../node_modules/three/examples/jsm/controls/OrbitControls.js';
let scene = new three.Scene();
let camera = new three.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 256);
let renderer = new three.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
texture.loadTex();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = three.PCFSoftShadowMap;
{
    // ===== แสง Directional + เงา =====
    var dirLight = new three.DirectionalLight(0xffffff, 1);
    dirLight.position.set(0, 0, -5);
    dirLight.castShadow = true; // <== เปิดเงา

    // ปรับขนาดแผนที่เงา (ถ้าเงาเบลอหรือไม่ตรง ให้ลองปรับตรงนี้)
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;

    // ปรับระยะกล่องเงา (เพื่อควบคุมบริเวณที่จะมีเงา)
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 300;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    dirLight.shadow.bias = -0.005;
    scene.add(dirLight);
    var LiHlpr = new three.DirectionalLightHelper(dirLight, 5);
    var shadowCamera = new three.CameraHelper(dirLight.shadow.camera);
    scene.add(LiHlpr);
    scene.add(shadowCamera);
    //scene.add(Mesh);
}
scene.background = new three.Color(0x99FFFF);
let world = new core.World.World();
let pointatonehrunededtwentyetghs = new three.AxesHelper(1);
pointatonehrunededtwentyetghs.position.set(0, 128, 0);
scene.add(pointatonehrunededtwentyetghs);
camera.position.set(0, 0, 5);
dirLight.position.set(0, 256, -50);
scene.add(world.groups);

let _stat = stat.default();
document.body.appendChild(_stat.domElement);
////setTimeout(texture.getAtlasTexture, 2000);
function enableShadows(scene) {
    scene.traverse((object) => {
        if (object) {
            if (object.castShadow != null) object.castShadow = true;
            if (object.receiveShadow != null) object.receiveShadow = true;
            if (object.isMesh && true/*!object.material instanceof three.MeshStandardMaterial))*/) {
                console.log('create new material');
                let oldMat = object.material;
                object.material = new three.MeshStandardMaterial({
                    color: oldMat.color || new three.Color(0xffffff),
                    map: oldMat.map || null,
                    emissive: new three.Color(0x000000),
                    emissiveIntensity: 1,
                    emissiveMap: oldMat.emissiveMap
                });
            }
        }
    });
}
const plane = new three.Mesh(
    new three.PlaneGeometry(10, 10),
    new three.MeshStandardMaterial({ map: texture.getAtlasTexture() })
)
plane.position.z = -11;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);
const block = new three.Mesh(
    new three.BoxGeometry(3, 3, 3),
    new three.MeshStandardMaterial({ map: texture.getAtlasTexture() })
);

block.position.z = -11;
block.position.y = 2;
scene.add(block);
setTimeout(() => {
    plane.material = new three.MeshStandardMaterial({ map: texture.getAtlasTexture() });
    block.material.dispose();
    block.material = new three.MeshStandardMaterial({ map: texture.getAtlasTexture() });
    let uvs = [];
    let uv = texture.getUVfromName('techmine:stone');
    for (let s in FaceDirs) {
        uvs.push(...texture.getUVfromName('techmine:wood_log', s));
    }
    block.geometry.setAttribute('uv', new three.BufferAttribute(new Float32Array(uvs), 2));
    block.geometry.computeVertexNormals();
}, 1000);
setTimeout(enableShadows, 5000, scene);
setTimeout(() => {
    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            world.createChunk(i, j);
            Generate(world.getChunk(i, j), i, j, 140);
        }
    }
    world.renderAllChunk();
}, 2000);
let lastTime = Date.now();
let dt = 0;
world.renderAllChunk();
let player = new Player(world);
scene.add(player.mesh);
player.mesh.position.y = 60;
camera.position.y = 1.5;
player.mesh.add(camera);
//scene.add(player.debugBox);
const animate = () => {
    _stat.begin();
    dt = Date.now() - lastTime;
    lastTime = Date.now();
    player.update(dt);
    const pos = player.mesh.position;
    document.getElementById('pos').innerText = `${pos.x.toFixed(6)}, ${pos.y.toFixed(6)}, ${pos.z.toFixed(6)}`;
    renderer.render(scene, camera);
    _stat.end();
    requestAnimationFrame(animate);
}

animate();
