'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Beaches() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0.8]);

    return (
        <section ref={ref} className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center bg-sky-900">
            {/* Background (Parallax) */}
            <motion.div
                style={{ y }}
                className="absolute inset-0 z-0 bg-cover bg-center opacity-60"
                // Placeholder background - ideally a video or high-res image
                initial={{ backgroundColor: "#0c4a6e" }}
            >
                <div className="w-full h-full bg-gradient-to-b from-transparent to-black/60" />
            </motion.div>

            <motion.div
                style={{ opacity }}
                className="relative z-10 text-center max-w-4xl px-6"
            >
                <h2 className="font-serif text-5xl md:text-7xl text-white mb-6">
                    Pristine Shores
                </h2>
                <p className="text-white/80 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto">
                    From the pink sands of Komodo to the hidden coves of Raja Ampat.
                    Experience the calm before the adventure.
                </p>
            </motion.div>
        </section>
    );
}
