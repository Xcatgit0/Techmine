import { PlayerController, VirtualJoystick } from "./core/core.js";
import * as three from 'three';
import * as core from './core/core.js';
export class Player {
    constructor(world) {
        this.world = world;
        this.mesh = new three.Group();
        let capsuleGeometry = new three.CapsuleGeometry(0.5, 2);
        let capsule = new three.Mesh(
            capsuleGeometry,
            new three.MeshStandardMaterial({ color: 0xffffff })
        );
        capsule.castShadow = true;
        capsule.receiveShadow = true;
        capsule.position.y = 1.5;
        this.mesh.add(capsule);
        this.onground = false;
        this.joystick = new VirtualJoystick.VirtualJoystick();
        this.controller = new PlayerController.PlayerController(this.mesh, this.joystick);
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.onground) {
                this.mesh.position.y += 1;
            }
        });
        this.debugBox = new three.Mesh(
            new three.BoxGeometry(1.2, 1.2, 1.2),
            new three.MeshStandardMaterial({ color: 0xffff00 })
        );
    }
    update(dt) {
        const block = core.Chunk.getBlock(
            Math.trunc(this.mesh.position.x),
            Math.trunc(this.mesh.position.y),
            Math.trunc(this.mesh.position.z),
            16, this.world);
        if (block !== null) {
            this.onground = block.id !== 'techmine:air';
        }
        if (!this.onground) {
            this.mesh.position.y -= 0.005 * dt;
        }
        const b = core.Chunk.getBlock(
            Math.trunc(this.mesh.position.x),
            Math.trunc(this.mesh.position.y) + 1,
            Math.trunc(this.mesh.position.z),
            16, this.world);
        if (b !== null) {
            this.mesh.position.y += (b.id !== 'techmine:air') ? 0.01 * dt : 0;
        }
        this.debugBox.position.copy(new three.Vector3(
            Math.trunc(this.mesh.position.x),
            Math.trunc(this.mesh.position.y) + 1,
            Math.trunc(this.mesh.position.z)));
        this.controller.update(dt / 1000);
    }
}
