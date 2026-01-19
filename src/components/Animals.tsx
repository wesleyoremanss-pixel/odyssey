'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

const animals = [
    { name: "Komodo Dragon", description: "Ancient guardian of the islands.", color: "bg-emerald-900" },
    { name: "Orangutan", description: "The gentle giant of the forest.", color: "bg-orange-900" },
    { name: "Tarsius", description: "Watching from the shadows.", color: "bg-zinc-800" }
];

export default function Animals() {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["1%", "-65%"]);

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-black">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                <motion.div style={{ x }} className="flex gap-10 px-10">
                    {/* Intro Card */}
                    <div className="flex-shrink-0 w-[80vw] md:w-[40vw] h-[60vh] flex flex-col justify-center">
                        <h2 className="font-serif text-5xl md:text-7xl text-white leading-tight">
                            Endemic <br /> <span className="text-green-500">Wonders</span>
                        </h2>
                        <p className="mt-8 text-neutral-400 text-lg">
                            Meet the inhabitants that can only be found here.
                        </p>
                    </div>

                    {/* Animal Cards */}
                    {animals.map((animal, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex-shrink-0 w-[85vw] md:w-[50vw] h-[60vh] rounded-2xl flex flex-col justify-end p-8 md:p-12 relative overflow-hidden group transition-transform duration-300 hover:scale-[1.02]",
                                animal.color
                            )}
                        >
                            <div className="relative z-20">
                                <h3 className="font-serif text-4xl text-white mb-2">{animal.name}</h3>
                                <p className="text-white/80">{animal.description}</p>
                            </div>
                            {/* Background Pattern/Image Placeholder */}
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
