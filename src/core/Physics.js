import * as core from './core.js';
import * as three from 'three';

class Entity {
    constructor(x, y, z, width = 0.6, height = 1.8, depth = 0.6) {
        this.x = x; // center X
        this.y = y; // bottom Y (เท้า)
        this.z = z; // center Z
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.onGround = false;
        this.freeze = false;
    }

    getAABB() {
        return {
            minX: (this.x - this.width / 2) +0.35,
            maxX: (this.x + this.width / 2) +0.35,
            minY: this.y,
            maxY: this.y + this.height,
            minZ: (this.z - this.depth / 2) +0.35,
            maxZ: (this.z + this.depth / 2) +0.35,
        };
    }
}

class PhysicsEngine {
    constructor(core, world) {
        this.core = core;
        this.world = world;
        this.entities = [];
        this.gravity = 9.8;
        this.debugGroup = new three.Group();
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    update(dt) {
        for (let entity of this.entities) {
            if (entity.freeze) continue;
            this.applyPhysics(entity, dt);
        }
    }

    applyPhysics(entity, dt) {
        // gravity
        entity.vy -= this.gravity * dt;

        entity.onGround = false;

        // update each axis
        entity.x = this.moveAxis(entity, entity.x, entity.vx * dt, "x");
        entity.y = this.moveAxis(entity, entity.y, entity.vy * dt, "y");
        entity.z = this.moveAxis(entity, entity.z, entity.vz * dt, "z");

        // entity vs entity collision
        for (let other of this.entities) {
            if (other !== entity && this.intersectAABB(entity.getAABB(), other.getAABB())) {
                this.resolveEntityCollision(entity, other);
            }
        }
    }
    /**
     * 
     * @param {three.Object3D} threeObject 
     * @param {Entity} entity 
     */
    setPosition(threeObject, entity) {
        return threeObject.position.copy(new three.Vector3(entity.x, entity.y + 0.5, entity.z));
    }

    moveAxis(entity, pos, delta, axis) {
        if (delta === 0) return pos;

        let newPos = pos + delta;
        const EPS = 1e-6;
        const VERTICAL_TOLERANCE = 0.005;
        const halfW = entity.width / 2;
        const halfH = entity.height / 2;
        const halfD = entity.depth / 2;
        const aabb = entity.getAABB();

        let minX, maxX, minY, maxY, minZ, maxZ;

        if (axis === "x") {
            minX = Math.floor(newPos - halfW + EPS);
            maxX = Math.floor(newPos + halfW - EPS);
            minY = Math.round(entity.y + VERTICAL_TOLERANCE);
            maxY = Math.floor(entity.y + entity.height - EPS);
            minZ = Math.floor(entity.z - halfD + EPS);
            maxZ = Math.floor(entity.z + halfD - EPS);
        } else if (axis === "z") {
            minX = Math.floor(entity.x - halfW + EPS);
            maxX = Math.floor(entity.x + halfW - EPS);
            minY = Math.round(entity.y + VERTICAL_TOLERANCE);
            maxY = Math.floor(entity.y + entity.height - EPS);
            minZ = Math.floor(newPos - halfD + EPS);
            maxZ = Math.floor(newPos + halfD - EPS);
        } else if (axis === "y") {
            if (delta < 0) {
                // กำลังลง → ตรวจ floor ของ block edge
                minY = Math.ceil((entity.y - EPS) * 2) / 2;
                maxY = Math.floor((entity.y + entity.height - EPS) * 2) / 2;
            } else {
                // กำลังขึ้น → ตรวจ ceiling ของ block edge
                minY = Math.ceil(entity.y * 2) / 2;
                maxY = Math.floor((entity.y + entity.height + EPS) * 2) / 2;
            }
            minX = Math.floor(entity.x - halfW + EPS);
            maxX = Math.floor(entity.x + halfW - EPS);
            minZ = Math.floor(entity.z - halfD + EPS);
            maxZ = Math.floor(entity.z + halfD - EPS);
        }

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                for (let z = minZ; z <= maxZ; z++) {
                    const block = this.core.Chunk.getBlock(x, y, z, 16, this.world);
                    if (block.id !== "techmine:air") {
                        // collision
                        if (axis === "x") {
                            newPos = delta > 0 ? x - halfW - EPS : x + 1 + halfW + EPS;
                            entity.vx = 0;
                        } else if (axis === "y") {
                            if (delta > 0) newPos = y + entity.height - EPS; // ชนเพดาน
                            else {
                                newPos = y + EPS; // ยืนบนพื้น
                                entity.onGround = true;
                            }
                            entity.vy = 0;
                        } else if (axis === "z") {
                            newPos = delta > 0 ? z - halfD - EPS : z + 1 + halfD + EPS;
                            entity.vz = 0;
                        }
                        return newPos;
                    }
                }
            }
        }

        return newPos;
    }

    intersectAABB(a, b) {
        return (
            a.minX <= b.maxX && a.maxX >= b.minX &&
            a.minY <= b.maxY && a.maxY >= b.minY &&
            a.minZ <= b.maxZ && a.maxZ >= b.minZ
        );
    }

    resolveEntityCollision(a, b) {
        a.vx = a.vy = a.vz = 0;
    }

    createDebugHitboxes(scene) {
        this.debugGroup.clear();
        for (let entity of this.entities) {
            const aabb = entity.getAABB();
            const size = new three.Vector3(
                aabb.maxX - aabb.minX,
                aabb.maxY - aabb.minY,
                aabb.maxZ - aabb.minZ
            );
            const center = new three.Vector3(
                (aabb.minX + aabb.maxX) / 2,
                (aabb.minY + aabb.maxY) / 2,
                (aabb.minZ + aabb.maxZ) / 2
            );

            const boxGeo = new three.BoxGeometry(size.x, size.y, size.z);
            const boxMat = new three.MeshBasicMaterial({
                color: 0xff0000,
                wireframe: true,
                opacity: 0.5,
                transparent: true
            });
            const mesh = new three.Mesh(boxGeo, boxMat);
            mesh.position.copy(center);

            // velocity arrow
            const arrow = new three.ArrowHelper(
                new three.Vector3(entity.vx, entity.vy, entity.vz).normalize(),
                center,
                1,
                0x00ff00
            );

            this.debugGroup.add(mesh);
            this.debugGroup.add(arrow);
        }
    }
}

export { Entity, PhysicsEngine };
