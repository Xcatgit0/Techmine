// PlayerController.js
import * as THREE from 'three';

export class PlayerController {
    constructor(camera, joystick) {
        this.camera = camera;
        this.joystick = joystick;

        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        this.yaw = 0; // มุมกล้องแนว yaw
        this.speed = 8; // หน่วยต่อวินาที
    }

    update(delta) {
        // รับข้อมูลจาก joystick
        const input = this.joystick.getInput(); // ควร return { x: -1 to 1, y: -1 to 1, yaw: -1 to 1 }

        // หมุนกล้องตาม yaw
        this.yaw -= input.yaw * delta * 2; // ปรับความเร็วการหมุนได้
        this.camera.rotation.set(0, this.yaw, 0);

        // เคลื่อนที่แนวหน้าหลังซ้ายขวา
        this.direction.set(0, 0, 0);
        if (input.y !== 0) this.direction.z = input.y;
        if (input.x !== 0) this.direction.x = input.x;

        this.direction.normalize();

        // คำนวณความเร็ว
        this.velocity.copy(this.direction).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        this.velocity.multiplyScalar(this.speed * delta);

        this.camera.position.add(this.velocity);
    }
}
