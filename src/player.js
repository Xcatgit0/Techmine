import { PlayerController, VirtualJoystick } from "./core/core.js";
import * as three from 'three';
import * as core from './core/core.js';
import { EventEmitter } from "./EventEmitter.js";
import { Entity, PhysicsEngine } from "./core/Physics.js"; // 👈 import entity
import * as TextTexture from './core/TextTexture.js';
import disposeGroup from "./disposer.js";
const THREE = three;
export function createPlayerMesh(displayName) {
    // Mesh แสดงผล
    let mesh = new three.Group();
const dir = new THREE.Vector3(0, 0, -1).normalize(); // ทิศทาง
const origin = new THREE.Vector3(0, 0, 0);          // จุดเริ่ม
const length = 5;                                   // ความยาว
const color = 0xff0000;                             // สีแดง

const arrow = new THREE.ArrowHelper(
    dir,
    origin,
    length,
    color
);

mesh.add(arrow);
    const axles = new three.AxesHelper(2);
    mesh.add(axles);
    let capsuleGeometry = new three.CapsuleGeometry(0.5, 2);
    let capsule = new three.Mesh(
        capsuleGeometry,
        new three.MeshStandardMaterial({ color: 0xffffff })
    );
    //;capsule.visible = false;
    capsule.castShadow = true;
    capsule.receiveShadow = true;
    capsule.position.y = 1.0; // ให้ origin = เท้า text at y 4
    mesh.add(capsule);
    if (displayName) {
        let texture = TextTexture.createTextTexture(displayName);
        let SpriteMaterial = new three.SpriteMaterial({ map: texture, transparent: true, alphaTest: 0.5 });
        let sprite = new three.Sprite(SpriteMaterial);
        sprite.scale.set(2, 1, 1);
        sprite.position.y = 3;
        mesh.add(sprite);
    }
    //setTimeout(() => { disposeGroup(mesh) }, 10_000);
    return mesh;
}
export class Player {
    /**
     * 
     * @param {core.World.World} world 
     * @param {any} joystick 
     * @param {PhysicsEngine} physicsEngine 
     */
    constructor(world, joystick, physicsEngine) {
        this.world = world;
        this.height = 2;

        // Mesh แสดงผล
        this.mesh = createPlayerMesh();

        // Entity ฟิสิกส์
        this.entity = new Entity(0, 0, 0, 0.8, 1.8, 0.8);
        this.physics = physicsEngine;
        this.entity.y = 50;
        this.physics.addEntity(this.entity);

        // Controller
        this.joystick = joystick ?? new VirtualJoystick.VirtualJoystick();
        this.controller = new PlayerController.PlayerController(this.mesh, this.joystick);

        this.event = new EventEmitter();
    }
    get position() {
        return this.mesh.position;
    }

    update(dtMil) {
        const dt = dtMil / 1000;

        // sync entity → mesh
        this.mesh.position.set(this.entity.x, this.entity.y, this.entity.z);

        // ควบคุม input จาก joystick → ปรับ vx, vz
        const speed = 4; // หน่วย/วินาที
        let moveX = this.joystick.input.x;
        let moveZ = this.joystick.input.y;
        let velocity = new three.Vector3(moveX, 0, moveZ).applyAxisAngle(new three.Vector3(0, 1, 0), this.mesh.rotation.y);
        velocity.multiplyScalar(speed);
        this.entity.vx = velocity.x * speed;
        this.entity.vz = velocity.z * speed;

        // กระโดด
        if (this.joystick.input.pitch > 0.5 && this.entity.onGround) {
            this.entity.vy = 10; // jump power
        }

        // อัปเดตฟิสิกส์
        //this.physics.update(dt);

        // sync mesh อีกทีหลังฟิสิกส์
        //this.mesh.position.set(this.entity.x, this.entity.y, this.entity.z);
        this.physics.setPosition(this.mesh, this.entity);
        // อัปเดต controller (กล้อง, การหมุน ฯลฯ)
        this.controller.update(dt, {});

    }
}
