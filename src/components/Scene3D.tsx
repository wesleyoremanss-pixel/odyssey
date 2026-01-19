'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import { Gate3D } from './Gate3D';

export default function Scene3D({ zIndex = 0 }: { zIndex?: number }) {
    return (
        // Sandwiched Layer
        // We pass z-index via prop to control layering
        <div className={`fixed inset-0 w-full h-full pointer-events-none`} style={{ zIndex }}>
            <Canvas
                shadows
                camera={{ position: [0, 0, 8], fov: 35 }}
                gl={{ alpha: true, antialias: true }}
            >
                
                <Suspense fallback={null}>
                    {/* LIGHTING RIG: Volcano Morning Match */}

                    {/* 1. Main Sun (Right-Top, Warm Orange) */}
                    {/* Simulates the light hitting the volcano from the right */}
                    <directionalLight
                        position={[10, 5, 2]}
                        intensity={2.5}
                        color="#ffaa55"
                        castShadow
                    />

                    {/* 2. Fill Light (Left, Cool Blue) */}
                    {/* Simulates sky reflection in shadows */}
                    <directionalLight
                        position={[-5, 5, 5]}
                        intensity={0.8}
                        color="#b0c4de"
                    />

                    {/* 3. Ambient (General soft glow) */}
                    <ambientLight intensity={0.4} color="#ffdcb4" />

                    {/* 4. Environment Reflection */}
                    <Environment preset="sunset" blur={1} />

                    <Gate3D />
                </Suspense>
            </Canvas>
        </div>
    );
}
