'use client';

import { motion } from 'framer-motion';

const navItems = [
    "Beaches",
    "Volcanoes",
    "Animals",
    "Culture",
    "Gastronomy",
    "Islands"
];

export default function Navigation({ isMobile }: { isMobile?: boolean }) {
    return (
        <nav className={`relative z-50 flex flex-col items-center justify-center pb-20 ${isMobile ? 'pl-2 items-start' : ''}`}>
            <div className="
         relative px-8 py-8
         flex flex-col gap-6
         items-start
      ">
                {navItems.map((item, i) => (
                    <motion.div
                        key={item}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i, duration: 0.5, ease: "backOut" }}
                        className="group relative cursor-pointer text-left"
                    >
                        {/* 
                           Gradient Hover Logic:
                           - Text Default: text-neutral-400
                           - Text Hover: Transparent (to show bg clip)
                           - BG: Gradient from Orange to Cyan
                        */}
                        <span className="
                            font-serif text-xl md:text-3xl text-neutral-400 transition-all duration-500
                            group-hover:text-transparent group-hover:bg-clip-text 
                            group-hover:bg-gradient-to-r group-hover:from-[#FF9E00] group-hover:via-[#FF6D00] group-hover:to-[#00B4D8]
                        ">
                            {item}
                        </span>

                        {/* Animated Strikethrough/Line - Also Gradient */}
                        <span className="
                            absolute top-1/2 left-0 w-0 h-[2px] 
                            bg-gradient-to-r from-[#FF9E00] via-[#FF6D00] to-[#00B4D8]
                            group-hover:w-full transition-all duration-300 ease-in-out -translate-y-1/2 opacity-80
                        " />

                    </motion.div>
                ))}
            </div>
        </nav>
    );
}
