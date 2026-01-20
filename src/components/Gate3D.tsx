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

        // PHASE LOGIC
        // Phase 1 (0 -> 0.5): Approach
        // Phase 2 (0.5 -> 1.0): Return (Dark)

        let targetCamZ = 8;
        let targetCamX = 0;
        let colorIntensity = 1; // 1 = Normal, <1 = Darker

        if (p <= 0.5) {
            // PHASE 1: APPROACH
            const localP = p / 0.5; // 0 -> 1
            const ease = localP * localP * localP; // Ease In

            targetCamZ = 8 - (12 * ease); // 8 -> -4
            targetCamX = initialPos.x * localP; // 0 -> 2.45
            colorIntensity = 1;
        } else {
            // PHASE 2: RETURN
            const localP = (p - 0.5) / 0.5; // 0 -> 1
            const ease = 1 - Math.pow(1 - localP, 3); // Ease Out Cubic (Smooth Stop)

            // Return: -4 -> 8
            targetCamZ = -4 + (12 * ease); // Return to start

            // Return X: 2.45 -> 0
            targetCamX = initialPos.x * (1 - ease);

            // Darken: White -> Dark Grey (0.15)
            colorIntensity = 1 - (0.85 * ease);
        }

        state.camera.position.z = targetCamZ;
        state.camera.position.x = targetCamX;

        // Apply Color Darkening
        gateRef.current.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
                if (mat) {
                    mat.color.setRGB(colorIntensity, colorIntensity, colorIntensity);
                }
            }
        });
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
