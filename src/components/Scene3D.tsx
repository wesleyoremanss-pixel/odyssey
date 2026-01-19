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
                camera={{ position: [0, 0, 8], fov: 35 }} // Keep camera consistent
                gl={{ alpha: true, antialias: true }}
                className="pointer-events-auto" // Enable interaction
            >
                <Suspense fallback={null}>
                    {/* Lighting Rig - Studio Match */}
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={2} />
                    <Environment preset="city" />

                    <Gate3D />
                    
                    {/* Optional: Keep OrbitControls for subtle parallax interaction if desired, 
                        or remove for static feel. Keeping it enabled allows user to inspect. */}
                     <OrbitControls enableZoom={false} enablePan={false} />
                </Suspense>
            </Canvas>
        </div>
    );
}
