'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Volcanoes() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-neutral-900">

            {/* Layer 1: Background (Sky/Clouds) - Moves slow */}
            <motion.div
                style={{ y: bgY }}
                className="absolute inset-0 z-0 bg-gradient-to-b from-slate-800 to-slate-900"
            />

            {/* Layer 2: Main Subject (Volcano Silhouette Placeholder) - Static or slow */}
            <div className="absolute inset-x-0 bottom-0 h-[60%] z-10 bg-gradient-to-t from-black via-zinc-900 to-transparent clip-path-volcano opacity-90">
                {/* Visual representation of a volcano shape using CSS or placeholder */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full bg-orange-900/20 blur-3xl rounded-t-full scale-150" />
            </div>

            {/* Content */}
            <motion.div
                style={{ y: textY }}
                className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4"
            >
                <h2 className="font-serif text-6xl md:text-9xl text-white opacity-90 mix-blend-overlay">
                    Rinjani
                </h2>
                <h3 className="text-orange-500 font-sans tracking-[0.3em] uppercase mt-4 text-sm md:text-base">
                    The Sleeping Giant
                </h3>
            </motion.div>

            {/* Foreground Mist/Overlay */}
            <div className="absolute inset-0 z-30 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
        </section>
    );
}
