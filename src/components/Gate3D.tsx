'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export function Gate3D({ scrollProgress }: { scrollProgress?: any }) {
    // Load standard GLB (Recovered)
    const { scene } = useGLTF('/assets/bali-gate.glb');
    const gateRef = useRef<THREE.Group>(null);

    // Initial transforms
    const initialPos = new THREE.Vector3(2.452, -1.5, 0.168); // Y: -1.5 (lowered)
    const initialRot = new THREE.Euler(0, THREE.MathUtils.degToRad(-20), 0);
    const initialScale = new THREE.Vector3(0.8, 0.8, 0.8);

    useFrame(() => {
        if (!gateRef.current || !scrollProgress) return;

        // easeInCubic for exponential zoom feel
        const p = scrollProgress.get();
        const ease = p * p * p;

        // 1. Rotation: 0 to 360 (Right to Left)
        // Start from initialRot.y (-20 deg) and add 360 * p
        const targetRotY = initialRot.y + (Math.PI * 2 * ease);
        gateRef.current.rotation.y = targetRotY;

        // 2. Zoom / Position Z
        // Move from 0.168 to +10 (Through Camera)
        const targetZ = initialPos.z + (12 * ease);
        gateRef.current.position.z = targetZ;

        // 3. Move X slightly to center as it zooms
        const targetX = initialPos.x * (1 - ease); // tends to 0
        gateRef.current.position.x = targetX;

    });

    // Setup Materials
    useEffect(() => {
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                const material = mesh.material as THREE.MeshStandardMaterial;

                material.transparent = false;
                material.opacity = 1;
                material.side = THREE.DoubleSide;

                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }
        });
    }, [scene]);

    // Initial render state
    return (
        <group
            ref={gateRef}
            position={initialPos}
            scale={initialScale}
            rotation={initialRot}
        >
            <primitive object={scene} />
        </group>
    );
}

useGLTF.preload('/assets/bali-gate.glb');
