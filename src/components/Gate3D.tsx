'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function Gate3D(props: any) {
    const group = useRef<THREE.Group>(null);
    // Placeholder for missing modal, using a simple box if model fails or strictly for logic
    // If we don't have the asset, this might crash if we try to load it. 
    // Safest is to render a placeholder mesh

    return (
        <group ref={group} {...props} dispose={null}>
            <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="orange" />
            </mesh>
        </group>
    );
}
