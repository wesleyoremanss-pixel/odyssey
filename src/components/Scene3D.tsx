'use client';

import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Gate3D } from './Gate3D';
import { Suspense } from 'react';

// Props based on usage in IntroAnimation
interface Scene3DProps {
    zIndex: number;
    mouse: any;
    isMobile: boolean;
}

export default function Scene3D({ zIndex, mouse, isMobile }: Scene3DProps) {
    return (
        <div className="absolute inset-0 w-full h-full" style={{ zIndex }}>
            <Canvas camera={{ position: [0, 0, 15], fov: 35 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Suspense fallback={null}>
                    <Gate3D />
                    <Environment preset="sunset" />
                </Suspense>
            </Canvas>
        </div>
    );
}
