'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export function Gate3D({ scrollProgress, isMobile }: { scrollProgress?: any, isMobile?: boolean }) {
    // Load standard GLB (Recovered)
    const { scene } = useGLTF('/assets/bali-gate.glb');
    const gateRef = useRef<THREE.Group>(null);

    // Initial transforms
    // Mobile: Closer to center (1.2 instead of 2.452)
    const initialX = isMobile ? 1.2 : 2.452;
    const initialPos = new THREE.Vector3(initialX, -1.5, 0.168);
    const initialRot = new THREE.Euler(0, THREE.MathUtils.degToRad(-20), 0);
    const initialScale = new THREE.Vector3(0.8, 0.8, 0.8);

    useFrame((state) => {
        if (!gateRef.current || !scrollProgress) return;

        const p = scrollProgress.get();
        const ease = p * p * p; // easeInCubic

        // 1. GATE IS STATIC (User Requirement)
        gateRef.current.position.set(initialPos.x, initialPos.y, initialPos.z);
        gateRef.current.rotation.y = initialRot.y;

        // 2. CAMERA MOVES (We Approach The Gate)
        // Z: 8 -> -4 (Pass through)
        const targetCamZ = 8 - (12 * ease);
        state.camera.position.z = targetCamZ;

        // X: 0 -> initialX (Align with Gate center)
        // We simulate "Walking towards the gate" by moving the camera sideways to align.
        const targetCamX = initialPos.x * ease;
        state.camera.position.x = targetCamX;
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
