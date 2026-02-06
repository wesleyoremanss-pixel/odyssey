'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export function Gate3D({ mouse, isMobile }: { mouse: { x: any, y: any }, isMobile?: boolean }) {
    // Load standard GLB (Recovered)
    const { scene } = useGLTF('/assets/bali-gate.glb');
    const gateRef = useRef<THREE.Group>(null);

    // Initial transforms
    // Mobile: Closer to center (0.5) and smaller (0.6)
    const initialX = isMobile ? 0.5 : 2.452;
    const initialPos = new THREE.Vector3(initialX, -1.5, 0.168);
    const initialRot = new THREE.Euler(0, THREE.MathUtils.degToRad(-20), 0);
    const initialScale = isMobile ? new THREE.Vector3(0.55, 0.55, 0.55) : new THREE.Vector3(0.8, 0.8, 0.8);

    useFrame((state) => {
        if (!gateRef.current) return;

        // Reset Camera (Static View)
        state.camera.position.z = 8;
        state.camera.position.x = 0;

        // Mouse Parallax Logic
        // Mouse values are -0.5 to 0.5
        const mx = mouse.x.get();
        const my = mouse.y.get();

        // Target Rotation (Smoothly interpolate?) 
        // For now, direct mapping.
        gateRef.current.rotation.y = initialRot.y + (mx * 0.3); // Rotate Left/Right
        gateRef.current.rotation.x = (my * 0.15); // Rotate Up/Down slightly

        // Optional: Slight Position Parallax
        // gateRef.current.position.x = initialPos.x + (mx * 0.5);
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

                // Reset Color (In case it was darkened)
                material.color.setRGB(1, 1, 1);

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
