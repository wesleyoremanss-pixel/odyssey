'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Stage } from '@react-three/drei';
import { useControls } from 'leva';
import { Gate3D } from '@/components/Gate3D';
import { Suspense } from 'react';

// Wrapper to bridge Leva with the Component
function StudioScene() {
    const { position, rotation, scale } = useControls('Gate Transform', {
        position: { value: [-0.153, 1.410, 0.321], step: 0.001 },
        rotation: { value: [-89.80, 0.00, -20.60], step: 0.1 }, // Degrees
        scale: { value: [0.218, 0.198, 0.278], step: 0.001 }
    });

    return (
        <group 
            position={[position[0], position[1], position[2]]}
            scale={[scale[0], scale[1], scale[2]]}
            rotation={[
                 rotation[0] * (Math.PI / 180),
                 rotation[1] * (Math.PI / 180),
                 rotation[2] * (Math.PI / 180)
            ]}
        >
            <Gate3D />
        </group>
    );
}

export default function StudioPage() {
    return (
        <div className="relative w-full h-screen bg-[#050505] overflow-hidden">
            {/* BACKGROUND CONTEXT - Copied from IntroAnimation to give context */}
            <div className="absolute inset-0 -z-50 pointer-events-none opacity-50">
                 <img src="/assets/hero/bg.webp" className="absolute inset-0 w-full h-full object-cover" />
                 <img src="/assets/hero/mountains_back.webp" className="absolute inset-0 w-full h-full object-cover" />
                 <img src="/assets/hero/volcano-main.webp" className="absolute inset-0 w-full h-full object-cover" />
                 <img src="/assets/hero/foreground.webp" className="absolute inset-0 w-full h-full object-cover z-10" />
            </div>

            {/* STUDIO CANVAS */}
            <div className="absolute inset-0 z-50">
                <Canvas shadows camera={{ position: [0, 0, 8], fov: 35 }}>
                    <Suspense fallback={null}>
                        {/* We use standard lighting here to strictly test Position */}
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[10, 10, 5]} intensity={2} />
                        <Environment preset="city" />

                        <StudioScene />

                        <OrbitControls makeDefault />
                        <gridHelper args={[20, 20]} />
                        <axesHelper args={[5]} />
                    </Suspense>
                </Canvas>
            </div>
            
            <div className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded-xl max-w-sm pointer-events-none select-text z-[9999]">
                <h1 className="text-xl font-bold mb-2">3D Studio</h1>
                <p className="text-sm text-neutral-300 mb-4">
                    1. Use the panel on the right (SDK) to adjust Position, Rotation, Scale.
                    <br/>
                    2. Adjust until it matches the background.
                    <br/>
                    3. <strong>Write down the numbers</strong> and send them to me.
                </p>
                <p className="text-xs text-orange-500 font-mono">
                   * Rotation is in DEGREES for you.
                </p>
            </div>
        </div>
    );
}
