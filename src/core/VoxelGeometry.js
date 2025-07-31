import * as THREE from 'three';
const Size = 0.5;
/**
 * 
 * @param {Array<'Z+'|'Z-'|'X+'|'X-'|'Y+'|'Y-'>} sidesToInclude 
 */
function createSelectiveCube(sidesToInclude) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [
        // 8 จุดของลูกบาศก์
        [-Size, -Size, Size], // 0 front bottom left
        [Size, -Size, Size], // 1 front bottom right
        [Size, Size, Size], // 2 front top right
        [-Size, Size, Size], // 3 front top left
        [-Size, -Size, -Size], // 4 back bottom left
        [Size, -Size, -Size], // 5 back bottom right
        [Size, Size, -Size], // 6 back top right
        [-Size, Size, -Size], // 7 back top left
    ];

    const faceMap = {
        'Z+': [[0, 1, 2], [0, 2, 3]], // front
        'Z-': [[5, 4, 7], [5, 7, 6]], // back
        'X+': [[1, 5, 6], [1, 6, 2]], // right
        'X-': [[4, 0, 3], [4, 3, 7]], // left
        'Y+': [[3, 2, 6], [3, 6, 7]], // top
        'Y-': [[4, 5, 1], [4, 1, 0]]  // bottom
    };

    const faces = [];
    for (const side of sidesToInclude) {
        if (faceMap[side]) {
            faces.push(...faceMap[side]);
        }
    }

    const positions = new Float32Array(vertices.flat());
    const indices = new Uint16Array(faces.flat());
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals();

    return geometry;
}
//const Size = 0.5;

/**
 * 
 * @param {Array<'Z+'|'Z-'|'X+'|'X-'|'Y+'|'Y-'>} sidesToInclude 
 */
function createIndices(sidesToInclude) {
    const faceVertices = {
        'Z+': [ // front
            [-Size, -Size, Size],
            [Size, -Size, Size],
            [-Size, Size, Size],
            [Size, Size, Size]
        ],
        'Z-': [ // back
            [Size, -Size, -Size],
            [-Size, -Size, -Size],
            [Size, Size, -Size],
            [-Size, Size, -Size]
        ],
        'X+': [ // right
            [Size, -Size, Size],
            [Size, -Size, -Size],
            [Size, Size, Size],
            [Size, Size, -Size]
        ],
        'X-': [ // left
            [-Size, -Size, -Size],
            [-Size, -Size, Size],
            [-Size, Size, -Size],
            [-Size, Size, Size]
        ],
        'Y+': [ // top
            [-Size, Size, Size],
            [Size, Size, Size],
            [-Size, Size, -Size],
            [Size, Size, -Size]
        ],
        'Y-': [ // bottom
            [-Size, -Size, -Size],
            [Size, -Size, -Size],
            [-Size, -Size, Size],
            [Size, -Size, Size]
        ]
    };

    const positions = [];
    const indices = [];
    let vertexIndex = 0;

    for (const side of sidesToInclude) {
        const verts = faceVertices[side];
        if (!verts) continue;

        // Push 4 vertices (quad)
        for (const v of verts) {
            positions.push(...v);
        }

        // Add 2 triangles (6 indices)
        indices.push(
            vertexIndex + 0,
            vertexIndex + 1,
            vertexIndex + 2,
            vertexIndex + 2,
            vertexIndex + 1,
            vertexIndex + 3
        );

        vertexIndex += 4;
    }

    return {
        positions,
        indices
    };
}

export { createSelectiveCube, createIndices }
