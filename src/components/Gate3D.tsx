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

    return (
        <group 
            ref={gateRef} 
            position={[-0.153, 1.410, 0.321]} 
            scale={[0.218, 0.198, 0.278]} 
            rotation={[
                THREE.MathUtils.degToRad(-89.80), 
                THREE.MathUtils.degToRad(0.00), 
                THREE.MathUtils.degToRad(-20.60)
            ]}
        >
            <primitive object={scene} />
            
            {/* 
                DEBUG: FALLBACK RED BOX 
                If you see this but NOT the gate -> The Gate is invisible/transparent/too small.
                If you see NOTHING -> The scene/camera is broken.
            */}
            <mesh position={[0, 0, 0]}>
                 <boxGeometry args={[5, 1, 1]} />
                 <meshBasicMaterial color="red" wireframe />
            </mesh>
        </group>
    );
}

useGLTF.preload('/assets/bali-gate.glb');
