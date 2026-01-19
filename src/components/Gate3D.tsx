'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export function Gate3D() {
    // Load standard GLB (Recovered)
    const { scene } = useGLTF('/assets/bali-gate.glb');
    const gateRef = useRef<THREE.Group>(null);

    // Setup Materials for better lighting reception
    useEffect(() => {
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                const material = mesh.material as THREE.MeshStandardMaterial;

                // Enhance material properties
                material.transparent = false; // Solid object
                material.opacity = 1;
                material.roughness = 0.7; // Stone-like
                material.metalness = 0.1;

                // Enable shadow casting/receiving
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }
        });
    }, [scene]);

    useFrame((state) => {
        if (!gateRef.current) return;

        // SCROLL LOGIC
        const scrollMax = document.body.scrollHeight - window.innerHeight;
        const scrollY = window.scrollY;
        const progress = scrollMax > 0 ? Math.min(scrollY / scrollMax, 1) : 0;

        // --- ANIMATION ---

        // 1. Rotation: Spin 360 (0 to 2*PI)
        // Happens mostly in first half of scroll
        const rotateProgress = Math.min(progress * 2.5, 1); // 0 -> 0.4 Scroll covers full rotation
        // Smooth ease
        const tRot = rotateProgress * rotateProgress * (3 - 2 * rotateProgress);
        gateRef.current.rotation.y = tRot * Math.PI * 2;

        // 2. Position: CENTERED for Visibility check
        // Was: 3.5 (Right). Now: 0 (Center)
        const startPos = new THREE.Vector3(0, -2.5, 0);
        const endPos = new THREE.Vector3(0, -2.0, 1.5);

        const moveProgress = Math.min(progress * 2.0, 1);
        const tMove = moveProgress * moveProgress * (3 - 2 * moveProgress);
        gateRef.current.position.lerpVectors(startPos, endPos, tMove);

        // 3. Scale: BIGGER
        // Was: 0.55. Now: 1.5 (Triple size)
        const startScale = 1.6;
        const endScale = 2.2;

        gateRef.current.scale.setScalar(startScale + (endScale - startScale) * progress);
    });

    return (
        <group ref={gateRef} position={[0, -2.5, 0]} scale={[1.6, 1.6, 1.6]}>
            <primitive object={scene} />
        </group>
    );
}

useGLTF.preload('/assets/bali-gate.glb');
