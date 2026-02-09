'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function Gate3D(props: any) {
    const group = useRef<THREE.Group>(null);

    return (
        // @ts-ignore - R3F types mismatch with React 19
        <group ref={group} {...props} dispose={null}>
            <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="orange" />
            </mesh>
            {/* @ts-ignore */}
        </group>
    );
}
