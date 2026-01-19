'use client';

// Re-trigger build
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Navigation from './Navigation';
import Scene3D from './Scene3D';

export default function IntroAnimation() {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    const [isMobile, setIsMobile] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Scroll Logic
    const { scrollY } = useScroll();

    // Foreground Parallax Exit (Moves up as you scroll down)
    const yScrollForeground = useTransform(scrollY, [0, 800], [0, -200]);

    // Lift nav based on scroll
    const navTop = useTransform(
        scrollY,
        [0, 400],
        isMobile ? ["20%", "20%"] : ["40%", "50%"]
    );
    const navLeft = useTransform(
        scrollY,
        [0, 400],
        isMobile ? ["0%", "0%"] : ["50%", "5%"]
    );
    const navTranslateX = useTransform(scrollY, [0, 400], [isMobile ? "0%" : "-50%", isMobile ? "0%" : "0%"]);
    const navScale = useTransform(scrollY, [0, 400], [1, 0.8]);

    // Mouse Parallax Logic
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const xSky = useTransform(springX, [-0.5, 0.5], [15, -15]);
    const ySky = useTransform(springY, [-0.5, 0.5], [5, -5]);
    const xMountain = useTransform(springX, [-0.5, 0.5], [25, -25]);
    const yMountain = useTransform(springY, [-0.5, 0.5], [10, -10]);
    // xTemple removed (replaced by 3D)

    const xVolcano = useTransform(springX, [-0.5, 0.5], [45, -45]);
    const yVolcano = useTransform(springY, [-0.5, 0.5], [20, -20]);
    const xForeground = useTransform(springX, [-0.5, 0.5], [70, -70]);
    const yForeground = useTransform(springY, [-0.5, 0.5], [30, -30]);

    const yForegroundCombined = useTransform(
        [yForeground, yScrollForeground],
        ([yInteraction, yScroll]: any[]) => (yInteraction as number) + (yScroll as number)
    );

    // Scroll Transforms
    const scaleScrollForeground = useTransform(scrollY, [0, 400], [1, 1.5]);
    const opacityScrollForeground = useTransform(scrollY, [0, 300], [1, 0]);
    const blurScrollForeground = useTransform(scrollY, [0, 300], ["blur(0px)", "blur(10px)"]);
    const opacityScrollText = useTransform(scrollY, [0, 200], [1, 0]);

    const scaleForegroundCombined = useTransform(
        [scaleScrollForeground],
        ([scaleScroll]: any[]) => (scaleScroll as number)
    );

    // Gate Parallax Logic (Moved to Top Level)
    const xGate = useTransform(springX, [-0.5, 0.5], [60, -60]); // Between 45 and 70
    const yGate = useTransform(springY, [-0.5, 0.5], [25, -25]);  // Between 20 and 30

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth) - 0.5;
            const y = (e.clientY / innerHeight) - 0.5;
            mouseX.set(x);
            mouseY.set(y);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    // ... (rest of useEffects) ...

    useEffect(() => {
        const loadAssets = async () => {
            // ...
        };
        loadAssets();
    }, []);

    useEffect(() => {
        if (progress === 100) {
            setTimeout(() => setLoading(false), 500);
        }
    }, [progress]);

    return (
        <div className={`relative z-0 w-full bg-[#050505] ${loading ? 'h-screen overflow-hidden' : 'min-h-[200vh]'}`}>
            {/* ... */}
                {/* 3. Volcano (z-30) */}
                <motion.div
                    className="absolute inset-[-5%] w-[110%] h-[110%] z-30"
                    style={{ x: xVolcano, y: yVolcano }}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: !loading ? 1 : 1.1, opacity: !loading ? 1 : 0 }}
                    transition={{ duration: 2.6, delay: 1.6, ease: "easeOut" }}
                >
                    <img src="/assets/hero/volcano-main.webp" className="w-full h-full object-cover object-[70%] md:object-center" alt="Volcano Main" />
                    <motion.div
                        className="absolute top-[40%] left-[50%] w-[100px] h-[100px] bg-orange-600 blur-[60px] rounded-full mix-blend-screen -z-10"
                        animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.2, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        style={{ x: "-50%", y: "-50%" }}
                    />
                </motion.div>

                {/* 4. THE GATE (3D) (z-40) */}
                {!loading && (
                    <motion.div
                        className="absolute inset-[-5%] w-[110%] h-[110%] z-40"
                        style={{ 
                            x: xGate,
                            y: yGate
                        }}
                    >
                        <Scene3D zIndex={40} />
                    </motion.div>
                )}

                {/* 5. Foreground (z-50) */}
                <motion.div
                    className="absolute inset-[-5%] w-[110%] h-[110%] z-50 pointer-events-none"
                    style={{
                        x: xForeground,
                        y: yForegroundCombined,
                        scale: scaleForegroundCombined,
                        opacity: opacityScrollForeground,
                        filter: blurScrollForeground
                    }}
                    initial={{ scale: 1.15, opacity: 0 }}
                    animate={{ scale: !loading ? 1.05 : 1.15, opacity: !loading ? 1 : 0 }}
                    transition={{ duration: 3.0, delay: 1.8 }}
                >
                    <img src="/assets/hero/foreground.webp" className="w-full h-full object-cover transform scale-125 md:scale-100 origin-bottom" alt="Foreground" />
                </motion.div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none z-[60]" />

                 {/* Text (z-70) */}
                 <motion.div
                    className="absolute inset-0 flex flex-col items-start justify-end pl-[5%] pb-[10%] md:pb-[5%] z-[70] pointer-events-none"
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: !loading ? 1 : 0 }}
                        transition={{ duration: 2.0, delay: 1.5, ease: "easeOut" }}
                    >
                        <motion.div style={{ opacity: opacityScrollText }}>
                            <h1 className="font-[family-name:var(--font-cormorant)] italic font-light text-[12vw] md:text-[6vw] leading-[1.1] text-[#E5E0D8]">
                                Travel deeper.
                            </h1>
                            <p className="mt-2 md:mt-4 font-[family-name:var(--font-cormorant)] text-lg md:text-2xl text-[#E5E0D8]/80 italic">
                                Not faster. Not louder. Just deeper.
                            </p>
                        </motion.div>
                    </motion.div>
                </motion.div>

            </div>
            <div className="h-[100vh]" />
        </div>
    );
}

const LogoAnimator = ({ loading, progress, isMobile }: { loading: boolean, progress: number, isMobile: boolean }) => {
    // Generate Keyframes for CSS Animation
    // 0% -> 1.webp
    // 50% -> 39.webp
    // 100% -> 1.webp
    const generateKeyframes = () => {
        let css = `@keyframes logoLoop {`;
        const totalFrames = 39;
        const totalSteps = (totalFrames * 2) - 2; // 76 steps (1->39->2)
        
        for (let step = 0; step <= totalSteps; step++) {
            const percentage = (step / totalSteps) * 100;
            let frame;
            if (step < totalFrames) {
                frame = step + 1; // 1 to 39
            } else {
                frame = totalFrames - (step - totalFrames) - 1; // 38 to 1
            }
            // Ensure frame is clamped
            if (frame < 1) frame = 1;
            
            css += `
                ${percentage}% { background-image: url('/assets/logo-animation/${frame}.webp'); }`;
        }
        css += `}`;
        return css;
    };

    const [isPlaying, setIsPlaying] = useState(false);
    const [shouldStop, setShouldStop] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    const handleMouseEnter = () => {
        if (!loading) {
            setIsPlaying(true);
            setShouldStop(false);
            setHasInteracted(true);
        }
    };

    const handleMouseLeave = () => {
        // Don't stop immediately, wait for cycle end
        setShouldStop(true);
    };

    const handleAnimationIteration = () => {
        if (shouldStop) {
            setIsPlaying(false);
            setShouldStop(false);
        }
    };

    return (
        <div 
            className="relative w-full h-full flex items-center justify-center pointer-events-auto"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <style jsx>{`
                ${generateKeyframes()}
                .logo-anim {
                    background-size: contain;
                    background-repeat: no-repeat;
                    background-position: center;
                    width: 100%;
                    height: 100%;
                }
                .logo-anim.playing {
                    animation: logoLoop 2s steps(1) infinite;
                }
                .logo-anim.stopping {
                     /* 
                        Keep 2s to ensure NO JUMP/CUT on exit.
                        Standard smooth finish.
                     */
                    animation: logoLoop 2s steps(1) infinite;
                }
                .logo-static {
                    background-image: url('/assets/logo-man.webp');
                    background-size: contain;
                    background-repeat: no-repeat;
                    background-position: center;
                    width: 100%;
                    height: 100%;
                }
            `}</style>

             <motion.div
                className="relative h-full w-auto aspect-[1/1]"
                animate={
                    !loading
                        ? {
                            scale: 1.4,
                            top: '-6%', 
                            y: '0%', 
                            width: isMobile ? '90px' : '75px',
                            height: isMobile ? '35px' : '38px',
                            left: '50%', 
                            x: '-50%', // Back to center for final state
                        }
                        : { 
                            scale: 1.8, 
                            top: '50%', 
                            y: '-50%', 
                            x: '-40%', // Shifted right (was -42%)
                            width: isMobile ? '180px' : '300px', 
                            height: isMobile ? '180px' : '300px' 
                        }
                }
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
                <div className="relative w-full h-full">
                     {/* 1. GHOST LOGO (Background - always visible, low opacity) */}
                    <motion.div className="absolute inset-0 opacity-20">
                         <img src="/assets/logo-man.webp" alt="Ghost Logo" className="w-full h-full object-contain" />
                    </motion.div>

                     {/* 2. FILLING/ANIMATING LOGO (Foreground) */}
                    <motion.div
                        className="absolute inset-0 overflow-hidden"
                        animate={{ clipPath: loading ? `inset(${100 - progress}% 0 0 0)` : 'inset(0% 0 0 0)' }}
                        transition={{ clipPath: { duration: 0.1, ease: "linear" } }}
                    >
                        {/* 
                            Logic:
                            - If Loading: Show Static.
                            - If Playing: Show Anim Div (with onAnimationIteration).
                            - Else (Idle): Show Static.
                        */}
                        {!loading && isPlaying ? (
                             <div 
                                className={`logo-anim ${shouldStop ? 'stopping' : 'playing'}`}
                                onAnimationIteration={handleAnimationIteration}
                             />
                        ) : (
                             <img src="/assets/logo-man.webp" className="w-full h-full object-contain" alt="Static" />
                        )}
                    </motion.div>
                </div>

                <AnimatePresence>
                    {loading && (
                        <motion.div
                            className="absolute -bottom-2 left-0 right-0 text-center font-serif text-xl text-white"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {progress}%
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* EMERGENCY DEBUG OVERLAY REMOVED - Promoted to Main Scene */}
        </div>
    );
};
