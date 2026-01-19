'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Stage } from '@react-three/drei';
import { Gate3D } from '@/components/Gate3D';
import { Suspense, useState } from 'react';

// Wrapper to bridge React State with the Component
function StudioScene({ position, rotation, scale }: { position: number[], rotation: number[], scale: number[] }) {
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
    // State for controls
    const [pos, setPos] = useState({ x: -0.153, y: 1.410, z: 0.321 });
    const [rot, setRot] = useState({ x: -89.8, y: 0, z: -20.6 });
    const [scl, setScl] = useState({ v: 0.218 }); // Uniform scale for simplicity, or we can do 3 axes

    // Toggle for foreground visibility to allow seeing behind it
    const [showFg, setShowFg] = useState(true);

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden font-mono">
            {/* 1. LAYER: BACKGROUND (Sky + Volcano + Mountains) 
                Z-Index: 0
            */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
                 <img src="/assets/hero/bg.webp" className="absolute inset-0 w-full h-full object-cover" />
                 <img src="/assets/hero/mountains_back.webp" className="absolute inset-0 w-full h-full object-cover" />
                 <img src="/assets/hero/volcano-main.webp" className="absolute inset-0 w-full h-full object-cover" />
            </div>

            {/* 2. LAYER: 3D CANVAS (The Gate)
                Z-Index: 10
            */}
            <div className="absolute inset-0 z-10">
                <Canvas shadows camera={{ position: [0, 0, 8], fov: 35 }}>
                    <Suspense fallback={null}>
                        {/* Lighting to match scene */}
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[10, 10, 5]} intensity={2} />
                        <Environment preset="city" />

                        <StudioScene 
                            position={[pos.x, pos.y, pos.z]} 
                            rotation={[rot.x, rot.y, rot.z]} 
                            scale={[scl.v, scl.v, scl.v]} 
                        />

                        {/* OrbitControls need to handle events through the foreground layer? 
                            Actually, since FG is pointer-events-none, we are good.
                        */}
                        <OrbitControls makeDefault />
                        <gridHelper args={[20, 20]} />
                        <axesHelper args={[5]} />
                    </Suspense>
                </Canvas>
            </div>

             {/* 3. LAYER: FOREGROUND (Plants)
                Z-Index: 20
                This sits ON TOP of the Gate.
            */}
            {showFg && (
                <div className="absolute inset-0 z-20 select-none pointer-events-none">
                    <img src="/assets/hero/foreground.webp" className="absolute inset-0 w-full h-full object-cover" />
                </div>
            )}
            
            {/* CUSTOM CONTROLS */}
            <div className="absolute top-4 right-4 bg-black/90 text-white p-6 rounded-xl w-[320px] z-[9999] border border-white/20 shadow-2xl overflow-y-auto max-h-[90vh]">
                <h1 className="text-xl font-bold mb-4 text-orange-500 border-b border-orange-500/50 pb-2">3D Studio Control</h1>
                
                <div className="mb-4">
                     <label className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer">
                        <input type="checkbox" checked={showFg} onChange={(e) => setShowFg(e.target.checked)} />
                        <span>Show Foreground (Plants)</span>
                     </label>
                </div>
                
                {/* POSITION */}
                <div className="mb-6 space-y-3">
                    <h3 className="text-sm font-bold text-gray-400">Position</h3>
                    <div>
                        <div className="flex justify-between text-xs mb-1"><span>X</span><span>{pos.x.toFixed(3)}</span></div>
                        <input type="range" min="-5" max="5" step="0.001" value={pos.x} onChange={(e) => setPos({...pos, x: parseFloat(e.target.value)})} className="w-full" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1"><span>Y</span><span>{pos.y.toFixed(3)}</span></div>
                        <input type="range" min="-5" max="5" step="0.001" value={pos.y} onChange={(e) => setPos({...pos, y: parseFloat(e.target.value)})} className="w-full" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1"><span>Z</span><span>{pos.z.toFixed(3)}</span></div>
                        <input type="range" min="-5" max="5" step="0.001" value={pos.z} onChange={(e) => setPos({...pos, z: parseFloat(e.target.value)})} className="w-full" />
                    </div>
                </div>

                {/* ROTATION */}
                <div className="mb-6 space-y-3">
                    <h3 className="text-sm font-bold text-gray-400">Rotation (Degrees)</h3>
                    <div>
                        <div className="flex justify-between text-xs mb-1"><span>X</span><span>{rot.x.toFixed(1)}°</span></div>
                        <input type="range" min="-180" max="180" step="0.1" value={rot.x} onChange={(e) => setRot({...rot, x: parseFloat(e.target.value)})} className="w-full" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1"><span>Y</span><span>{rot.y.toFixed(1)}°</span></div>
                        <input type="range" min="-180" max="180" step="0.1" value={rot.y} onChange={(e) => setRot({...rot, y: parseFloat(e.target.value)})} className="w-full" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1"><span>Z</span><span>{rot.z.toFixed(1)}°</span></div>
                        <input type="range" min="-180" max="180" step="0.1" value={rot.z} onChange={(e) => setRot({...rot, z: parseFloat(e.target.value)})} className="w-full" />
                    </div>
                </div>

                {/* SCALE */}
                <div className="mb-6 space-y-3">
                    <h3 className="text-sm font-bold text-gray-400">Scale</h3>
                    <div>
                        <div className="flex justify-between text-xs mb-1"><span>Size</span><span>{scl.v.toFixed(3)}</span></div>
                        <input type="range" min="0.1" max="2" step="0.001" value={scl.v} onChange={(e) => setScl({v: parseFloat(e.target.value)})} className="w-full accent-orange-500" />
                    </div>
                </div>

                {/* OUTPUT */}
                <div className="bg-neutral-800 p-3 rounded text-xs break-all select-all font-mono">
                    <p className="text-gray-400 mb-1">Copy & Send These:</p>
                    <div className="text-orange-400">
                        Pos: [{pos.x.toFixed(3)}, {pos.y.toFixed(3)}, {pos.z.toFixed(3)}]<br/>
                        Rot: [{rot.x.toFixed(1)}, {rot.y.toFixed(1)}, {rot.z.toFixed(1)}]<br/>
                        Scl: [{scl.v.toFixed(3)}, {scl.v.toFixed(3)}, {scl.v.toFixed(3)}]
                    </div>
                </div>
            </div>
        </div>
    );
}
