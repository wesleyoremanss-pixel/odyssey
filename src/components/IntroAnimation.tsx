'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function IntroAnimation() {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return prev + 1;
            });
        }, 20);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (progress === 100) {
            setTimeout(() => setLoading(false), 500);
        }
    }, [progress]);

    return (
        <div className="relative h-screen w-full overflow-hidden bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
            {/* Background Content (Hero Text) - Fades in */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: !loading ? 1 : 0 }}
                transition={{ duration: 1, delay: 0.5 }}
            >
                <div className="relative w-[300px] h-[150px] md:w-[500px] md:h-[250px]">
                    {/* Logo Text SVG Layer */}
                    <img
                        src="/assets/logo-text.svg"
                        alt="Esat Can Travel Details"
                        className="absolute inset-0 w-full h-full object-contain z-10"
                    />
                </div>
            </motion.div>

            {/* Subtitle - Fades in */}
            <motion.div
                className="absolute bottom-20 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: !loading ? 1 : 0, y: !loading ? 0 : 20 }}
                transition={{ duration: 1, delay: 1 }}
            >
                <p className="font-serif text-lg md:text-xl text-neutral-600 dark:text-neutral-400">
                    Winter Edition 2026
                </p>
            </motion.div>

            {/* The ONE Logo Man Instance */}
            {/* We use layoutId to morph it from center loading state to hero composition state */}

            <div
                className={cn(
                    "relative z-50 transition-all duration-1000 ease-in-out",
                    loading ? "w-[300px] h-[150px] md:w-[500px] md:h-[250px]" : "w-[300px] h-[150px] md:w-[500px] md:h-[250px]"
                    // Actually, size stays roughly same, but context changes. 
                    // Since they are same size w/ same container, let's keep it simple.
                )}
            >
                <motion.div
                    className="relative w-full h-full"
                    // Zero Gravity Animation triggers only when NOT loading
                    animate={!loading ? {
                        y: [0, -10, 0],
                        rotate: [0, 1, -1, 0],
                        transition: {
                            repeat: Infinity,
                            duration: 6,
                            ease: "easeInOut",
                            delay: 1 // wait for transition
                        }
                    } : {}}
                    whileHover={!loading ? { y: -30, transition: { duration: 0.3 } } : {}}
                >
                    {/* Base Image (Outline or dimmed in loading) */}
                    <motion.img
                        layoutId="logo-man-image"
                        src="/assets/logo-man.webp"
                        alt="Man"
                        className={cn(
                            "absolute inset-0 w-full h-full object-contain transition-opacity duration-500",
                            loading ? "opacity-20 grayscale" : "opacity-100 grayscale-0"
                        )}
                    />

                    {/* Filling Overlay (Only visible during loading) */}
                    <AnimatePresence>
                        {loading && (
                            <motion.div
                                className="absolute inset-0 overflow-hidden"
                                initial={{ clipPath: 'inset(100% 0 0 0)' }}
                                animate={{ clipPath: `inset(${100 - progress}% 0 0 0)` }}
                                exit={{ opacity: 0, transition: { duration: 0.5 } }}
                            >
                                <img
                                    src="/assets/logo-man.webp"
                                    alt="Filling Man"
                                    className="w-full h-full object-contain"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Percentage Text */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            className="absolute -bottom-12 left-0 right-0 text-center font-serif text-xl text-black dark:text-white"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {progress}%
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
}
