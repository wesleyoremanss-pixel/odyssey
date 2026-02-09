'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import { Gate3D } from './Gate3D';
import { Suspense } from 'react';

interface Scene3DProps {
    zIndex: number;
    mouse: any;
    isMobile: boolean;
}

export default function Scene3D({ zIndex, mouse, isMobile }: Scene3DProps) {
    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex }}>
            <Canvas gl={{ antialias: true, alpha: true }}>
                <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={isMobile ? 45 : 35} />

                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff6b00" />

                <Suspense fallback={null}>
                    <Gate3D mouse={mouse} isMobile={isMobile} />
                    <Environment preset="sunset" />
                </Suspense>
            </Canvas>
        </div>
    );
}
