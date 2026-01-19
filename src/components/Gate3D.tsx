'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export function Gate3D() {
    // Load standard GLB (Recovered)
    const { scene } = useGLTF('/assets/bali-gate.glb');
    const gateRef = useRef<THREE.Group>(null);

    // DEBUG LOGGING
    useEffect(() => {
        if (scene) {
            console.log("✅ GLB LOADED SUCCESSFULLY", scene);
        } else {
            console.error("❌ GLB SCENE IS NULL");
        }
    }, [scene]);

    // Setup Materials
    useEffect(() => {
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                const material = mesh.material as THREE.MeshStandardMaterial;

                material.transparent = false;
                material.opacity = 1;
                material.side = THREE.DoubleSide; // Ensure double side rendering
                
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }
        });
    }, [scene]);

    // Final User-Defined Transforms (Studio Verified)
    // Pos: [2.452, -0.544, 0.168]
    // Rot: [85.9, 29.5, -8.8]
    // Scl: [2.0]
    
    return (
        <group 
            ref={gateRef} 
            position={[2.452, -0.544, 0.168]} 
            scale={[1.1, 1.1, 1.1]} 
            rotation={[
                THREE.MathUtils.degToRad(85.9), 
                THREE.MathUtils.degToRad(29.5), 
                THREE.MathUtils.degToRad(-8.8)
            ]}
        >
            <primitive object={scene} />
        </group>
    );
}

useGLTF.preload('/assets/bali-gate.glb');
