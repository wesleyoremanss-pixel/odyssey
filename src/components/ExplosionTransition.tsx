'use client';

import { motion, useTransform, MotionValue } from 'framer-motion';

export default function ExplosionTransition({ progress }: { progress: MotionValue<number> }) {

    // 1. White Flash (Fades In then Out)
    // 0 -> 0.5 (White In) -> 1.0 (Transparent again)
    const opacityFlash = useTransform(progress, [0, 0.6, 1], [0, 1, 0]);

    // 2. Shockwave Scale (Expands outward)
    const scaleShockwave = useTransform(progress, [0, 1], [0, 4]);
    const opacityShockwave = useTransform(progress, [0, 0.5, 1], [0, 1, 0]);

    // 3. Conditional Visibility (Only visible when progress > 0)
    const zIndex = useTransform(progress, (v) => v > 0.01 ? 100000 : -1);

    return (
        <motion.div
            className="fixed inset-0 w-screen h-screen pointer-events-none flex items-center justify-center overflow-hidden"
            style={{ zIndex }}
        >
            {/* White Flash Layer */}
            <motion.div
                className="absolute inset-0 bg-white"
                style={{ opacity: opacityFlash }}
            />

            {/* Shockwave Ring */}
            <motion.div
                className="absolute w-[100vw] h-[100vw] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 40%, rgba(255,255,255,1) 60%, rgba(255,255,255,1) 100%)',
                    scale: scaleShockwave,
                    opacity: opacityShockwave
                }}
            />

            {/* 
               Note: We do NOT need a permanent "Dark" layer here.
               The flash fades out (at progress 1.0) revealing whatever is underneath.
               Since IntroAnimation fades out at the same time, the user will see the 
               Second Section (bg-dark) which is physically below in the DOM.
            */}
        </motion.div>
    );
}
