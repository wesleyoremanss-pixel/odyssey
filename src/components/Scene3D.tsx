'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import { Gate3D } from './Gate3D';

export default function Scene3D({ zIndex = 0, mouse, isMobile }: { zIndex?: number, mouse: { x: any, y: any }, isMobile?: boolean }) {
    return (
        // Sandwiched Layer
        // Position handled by parent motion.div
        <div className={`w-full h-full pointer-events-none`} style={{ zIndex }}>
            <Canvas
                shadows
                camera={{ position: [0, 0, 8], fov: 35 }} // Keep camera consistent
                gl={{ alpha: true, antialias: true }}
                className="pointer-events-auto" // Enable interaction
            >
                <Suspense fallback={null}>
                    {/* Lighting Rig - Sunset / Golden Hour Match */}
                    <ambientLight intensity={1.5} color="#ffdcb4" /> {/* Warm ambient to lift shadows */}
                    <directionalLight
                        position={[5, 4, 3]}
                        intensity={3.5}
                        color="#ff9b50" // Strong orange sunlight
                        castShadow
                    />
                    <spotLight
                        position={[-5, 5, 5]}
                        intensity={4}
                        color="#ff6b00"  // Secondary sunset rim light from left
                        angle={0.5}
                    />
                    <Environment preset="sunset" />

                    <Gate3D mouse={mouse} isMobile={isMobile} />

                    {/* Optional: Keep OrbitControls for subtle parallax interaction if desired, 
                        or remove for static feel. Keeping it enabled allows user to inspect. */}
                    {/* OrbitControls REMOVED to prevent user from messing up the alignment */}
                    {/* <OrbitControls enableZoom={false} enablePan={false} /> */}
                </Suspense>
            </Canvas>
        </div>
    );
}
