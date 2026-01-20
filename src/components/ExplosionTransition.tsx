'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function ExplosionTransition({ trigger }: { trigger: boolean }) {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (trigger) {
            setIsActive(true);
        } else {
            // Reset logic if user scrolls back up? 
            // For now, let's keep it simple. If they scroll up, it might disappear.
            if (isActive) setIsActive(false);
        }
    }, [trigger]);

    if (!isActive && !trigger) return null;

    return (
        <div className="fixed inset-0 w-screen h-screen z-[100000] pointer-events-none flex items-center justify-center overflow-hidden">
            {/* 1. White Flash (Immediate) */}
            <motion.div
                className="absolute inset-0 bg-white"
                initial={{ opacity: 0 }}
                animate={trigger ? { opacity: [0, 1, 0] } : { opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            />

            {/* 2. Shockwave / Tunnel Effect (Radial Gradient Expanding) */}
            <motion.div
                className="absolute w-[200vw] h-[200vw] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 20%, rgba(255,255,255,1) 40%, rgba(255,255,255,1) 100%)',
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={trigger ? { scale: [0, 3], opacity: [0, 1, 0] } : { scale: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
            />

            {/* 3. Blackout / Dark Theme Reveal */}
            <motion.div
                className="absolute inset-0 z-[100000]"
                initial={{ opacity: 0 }}
                animate={trigger ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <img
                    src="/assets/bg-dark.webp"
                    className="w-full h-full object-cover"
                    alt="Dark Theme Background"
                />
            </motion.div>
        </div>
    );
}
