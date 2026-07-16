// PlayerController.js
import * as THREE from 'three';
// สมมติ player.position = {x, y, z}
// velocity = {dx, dy, dz}
// collisionSides = { Yplus: bool, Yminus: bool, Xplus: bool, Xminus: bool, Zplus: bool, Zminus: bool }

function updatePlayerPosition(player, velocity, collisionSides) {
    // ถ้าชนด้านบน Y+
    if (velocity.y > 0 && collisionSides.Yplus) {
        velocity.y = 0; // หยุดเคลื่อนที่ขึ้น
    }
    // ถ้าชนด้านล่าง Y-
    if (velocity.y < 0 && collisionSides.Yminus) {
        velocity.y = 0; // หยุดเคลื่อนที่ลง
    }
    // ถ้าชนด้านขวา X+
    if (velocity.x > 0 && collisionSides.Xplus) {
        velocity.x = 0; // หยุดเคลื่อนที่ขวา
    }
    // ถ้าชนด้านซ้าย X-
    if (velocity.x < 0 && collisionSides.Xminus) {
        velocity.x = 0; // หยุดเคลื่อนที่ซ้าย
    }
    // ถ้าชนด้านหน้า Z+
    if (velocity.z > 0 && collisionSides.Zplus) {
        velocity.z = 0; // หยุดเคลื่อนที่หน้า
    }
    // ถ้าชนด้านหลัง Z-
    if (velocity.z < 0 && collisionSides.Zminus) {
        velocity.z = 0; // หยุดเคลื่อนที่หลัง
    }

}
export class PlayerController {
    constructor(camera, joystick) {
        this.camera = camera;
        this.joystick = joystick;

        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        this.yaw = 0; // มุมกล้องแนว yaw
        this.speed = 8; // หน่วยต่อวินาที
    }

    update(delta, collistionside) {
        // รับข้อมูลจาก joystick
        const input = this.joystick.getInput(); // ควร return { x: -1 to 1, y: -1 to 1, yaw: -1 to 1 }

        // หมุนกล้องตาม yaw
        this.yaw -= input.yaw * delta * 2; // ปรับความเร็วการหมุนได้
	this.yaw = Math.atan2(Math.sin(this.yaw),Math.cos(this.yaw));
        this.camera.rotation.set(0, this.yaw, 0);

        // เคลื่อนที่แนวหน้าหลังซ้ายขวา
        this.direction.set(0, 0, 0);

        //if (input.y !== 0) this.direction.z = input.y;
        //if (input.x !== 0) this.direction.x = input.x;

        this.direction.normalize();

        // คำนวณความเร็ว
        this.velocity.copy(this.direction).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        //this.velocity.multiplyScalar(this.speed * delta);
        updatePlayerPosition(undefined, this.velocity, collistionside);
        this.camera.position.add(this.velocity);
    }
}
