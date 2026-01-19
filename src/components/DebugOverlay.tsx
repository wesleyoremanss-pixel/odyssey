'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

function Model({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    console.log("DebugOverlay: Model Loaded", scene);
    return <primitive object={scene} />;
}

export default function DebugOverlay() {
    return (
        <div className="fixed bottom-4 right-4 w-[300px] h-[300px] z-[9999] border-4 border-white bg-pink-500 rounded-xl overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 bg-black text-white text-xs p-1 z-10">
                DEBUG VIEW (Stage + AutoCenter)
            </div>
            <Canvas shadows gl={{ antialias: true }} camera={{ fov: 50 }}>
                <Suspense fallback={null}>
                    <Stage environment="city" intensity={0.6} adjustCamera>
                        <Model url="/assets/bali-gate.glb" />
                    </Stage>
                    <OrbitControls makeDefault />
                </Suspense>
            </Canvas>
        </div>
    );
}
