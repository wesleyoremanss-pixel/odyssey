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

    useFrame(() => {
        if (!gateRef.current || !scrollProgress) return;

        // easeInCubic for exponential zoom feel
        const p = scrollProgress.get();
        const ease = p * p * p;

        // 1. Rotation: Static (Face the user, or slight angle)
        // User requested NO SPIN. We keep the initial slight angle or set to 0.
        gateRef.current.rotation.y = initialRot.y;

        // 2. Zoom / Position Z
        // Move from 0.168 to +10 (Through Camera)
        const targetZ = initialPos.z + (12 * ease);
        gateRef.current.position.z = targetZ;

        // 3. Move X to center (0)
        // CRITICAL FIX: Use 'p' (linear) or 'ease' but ensure it reaches 0.
        // If we use (1-p), it moves linearly to center.
        // If we use (1-ease), it stays on right longer then snaps center.
        // The user wants it CENTERING as it moves. Linear 'p' is safer for alignment.
        const targetX = initialPos.x * (1 - p);
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
