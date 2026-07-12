try {
    // @ts-ignore
    window.screen.orientation.lock("landscape")
} catch (e) { }
window.onerror = function (...errr) {
    console.log(JSON.stringify(errr));
}
// @ts-check
import * as three from 'three';
import * as stat from '../stats.module.js';
import * as client from './Client.js';
import * as texture from './core/TextureIdentifierManager.js';
import { RendererInfo } from "./RendererInfo.js";
import { log } from './ScreenLogger.js';
import createGradientBackground from './Background.js';
//import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
let world = client.world;
let scene = new three.Scene();
scene.add(world.groups);
// @ts-ignore
window.scene = scene;
let camera = new three.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1024);
let renderer = new three.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
window.addEventListener("resize", () => {
    log("Resize to " + window.innerWidth + ", " + window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (window.innerWidth < window.innerHeight) {
        alert("Please rotate your device to landscape. \n โปรดหมุนอุปกรณ์ของคุณป็นแนวนอน");
        client.player.entity.freeze = true;
    } else {
        client.player.entity.freeze = false;
    }
});
if (window.innerWidth < window.innerHeight) {
    alert("Please rotate your device to landscape. \n โปรดหมุนอุปกรณ์ของคุณป็นแนวนอน");
    client.player.entity.freeze = true;
} else {
    client.player.entity.freeze = false;
}
/**
 * 
 * @param {TouchEvent} e 
 */
function sppgrnt(e) {
    e.stopPropagation();
}
renderer.domElement.addEventListener("touchstart", sppgrnt);
renderer.domElement.addEventListener("touchmove", sppgrnt);
renderer.domElement.addEventListener("touchend", sppgrnt);
// @ts-ignore
await texture.loadTex();
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
    dirLight.shadow.bias = 0;
    scene.add(dirLight);
    var LiHlpr = new three.DirectionalLightHelper(dirLight, 5);
    var shadowCamera = new three.CameraHelper(dirLight.shadow.camera);
    scene.add(LiHlpr);
    scene.add(shadowCamera);
    //scene.add(Mesh);
}
let disposeBackground = createGradientBackground(scene);

camera.position.set(0, 0, 5);
dirLight.position.set(0, 256, -50);
scene.add(world.groups);

let _stat = stat.default();
document.body.appendChild(_stat.domElement);
////setTimeout(texture.getAtlasTexture, 2000);

//setTimeout(enableShadows, 5000, scene);

let lastTime = Date.now();
let dt = 0;
world.renderAllChunk();



const joy = client.joy;
joy.div.style.zIndex = '9999999';
const yaw = client.yaw;
yaw.div.style.zIndex = '9999999';
document.body.appendChild(joy.div);
document.body.appendChild(yaw.div);
let physEngine = client.physEngine;

let player = client.player;
scene.add(player.mesh);
player.mesh.position.y = 60;
camera.position.y = 1.5;
player.mesh.add(camera);
scene.add(physEngine.debugGroup);
//scene.add(player.debugBox);
function getOS() {
    const userAgent = window.navigator.userAgent;
    const platform = window.navigator.platform; // Note: navigator.platform is deprecated for some uses.
    let os = "Unknown OS";

    // Define arrays for common OS platforms
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    const iosPlatforms = ['iPhone', 'iPad', 'iPod'];

    if (macosPlatforms.indexOf(platform) !== -1) {
        os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = 'Windows';
    } else if (/Android/.test(userAgent)) {
        os = 'Android';
    } else if (/Linux/.test(platform) || /Linux/.test(userAgent)) { // Check both platform and userAgent for Linux
        os = 'Linux';
    }

    return os;
}
let isMobile = false;
let mobileNames = ['iOS', 'Android'];
const detectedOS = getOS();
console.log(`Detected OS: ${detectedOS}`);
if (mobileNames.indexOf(detectedOS) !== -1) {
    isMobile = true;
}
console.log('you can press ctrl + y for toggle a mobile function');
window.addEventListener('keydown', (ev) => {
    if (ev.key == 'y' && ev.ctrlKey) isMobile = !isMobile;
});
let ambientLight = new three.AmbientLight(new three.Color(1, 1, 1));
scene.add(ambientLight);
const animate = () => {
    _stat.begin();
    dt = (Date.now()) - (lastTime);
    lastTime = Date.now();
    //physEngine.update(dt / 1000);
    client.update(dt, scene);
    const pos = player.mesh.position;
    document.getElementById('pos').innerText = `${pos.x.toFixed(6)}, ${pos.y.toFixed(6)}, ${pos.z.toFixed(6)}, Delta Time: ${dt.toFixed(8)} X: ${joy.input.x.toFixed(3)} Y: ${joy.input.y.toFixed(3)}`;
    info.update();
    renderer.render(scene, camera);
    if (isMobile) {
        joy.input.yaw = yaw.input.x;
        joy.input.pitch = yaw.input.y;
    }
    _stat.end();
    requestAnimationFrame(animate);
}


const info = new RendererInfo(renderer);
client.portal.initInfo(info);
animate();
if (window.location.port != "") { client.portal.connect(window.location.hostname + ":" + window.location.port + "/GameServer") } else {
    client.portal.connect(window.location.hostname + "/GameServer", "https://")
};
