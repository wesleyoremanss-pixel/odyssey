'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e: MouseEvent) => {
            if ((e.target as HTMLElement).closest('a, button, .cursor-pointer')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    // Simpler, elegant design: A small ring with a dot
    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center mix-blend-difference"
            animate={{
                x: mousePosition.x - 12,
                y: mousePosition.y - 12,
                width: isHovering ? 48 : 24,
                height: isHovering ? 48 : 24,
            }}
            transition={{
                type: "spring",
                stiffness: 250,
                damping: 20
            }}
        >
            {/* Outer Ring */}
            <div className={`absolute inset-0 rounded-full border border-white transition-opacity duration-300 ${isHovering ? 'border-2 opacity-50' : 'border opacity-30'}`} />

            {/* Inner Dot */}
            <div className="w-1.5 h-1.5 bg-white rounded-full" />

        </motion.div>
    );
}
