'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Stage } from '@react-three/drei';
import { Suspense } from 'react';
import { Gate3D } from './Gate3D';

export default function Scene3D({ zIndex = 0 }: { zIndex?: number }) {
    return (
        // Sandwiched Layer
        // We pass z-index via prop to control layering
        <div className={`fixed inset-0 w-full h-full pointer-events-none`} style={{ zIndex }}>
            <Canvas
                shadows
                camera={{ position: [0, 0, 8], fov: 35 }} // Keep camera consistent
                gl={{ alpha: true, antialias: true }}
                className="pointer-events-auto" // Enable interaction
            >
                <Suspense fallback={null}>
                    {/* 
                        MIGRATED FROM DEBUG OVERLAY:
                        Using <Stage> to ensure visibility since manual lighting/positioning was failing.
                        adjustCamera={false} allows us to keep our own camera position logic eventually,
                        but for now let's let Stage handle it to guarantee it shows up.
                    */}
                    <Stage environment="city" intensity={0.6}>
                        <Gate3D />
                    </Stage>
                    <OrbitControls makeDefault />
                </Suspense>
            </Canvas>
        </div>
    );
}
