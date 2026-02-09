// @ts-nocheck
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MotionValue } from 'framer-motion';

export function Gate3D({ mouse, isMobile }: { mouse: { x: MotionValue<number>, y: MotionValue<number> }, isMobile: boolean }) {
    const group = useRef<THREE.Group>(null);
    const { scene } = useGLTF('/assets/hero/bali-gate.glb');

    useFrame((state) => {
        if (group.current && !isMobile && mouse) {
            const x = mouse.x.get();
            const y = mouse.y.get();

            group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, x * 0.1, 0.1);
            group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -y * 0.05, 0.1);
        }
    });

    return (
        <group ref={group} dispose={null}>
            <primitive
                object={scene}
                scale={isMobile ? 1.5 : 2}
                position={[0, -2, 0]}
                rotation={[0, 0, 0]}
            />
        </group>
    );
}

useGLTF.preload('/assets/hero/bali-gate.glb');
