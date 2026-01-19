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

    // DEBUG MODE: RESET TO ORIGIN
    // User requested "Hardest Checks"
    // We remove all custom transforms to see if the model appears at 0,0,0
    
    return (
        <group 
            ref={gateRef} 
            position={[0, 0, 0]} 
            scale={[1, 1, 1]} 
            rotation={[0, 0, 0]}
        >
            <primitive object={scene} />
            {/* DEBUG OBJECT: Red Box to verify position visibility */}
            <mesh>
                 <boxGeometry args={[2, 2, 2]} />
                 <meshStandardMaterial color="red" wireframe />
            </mesh>
        </group>
    );
}

useGLTF.preload('/assets/bali-gate.glb');
