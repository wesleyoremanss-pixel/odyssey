'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, useGLTF } from '@react-three/drei';
import { useEffect, useState, useRef, Suspense } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence, MotionValue } from 'framer-motion';
import { Gate3D } from './Gate3D';
import Scene3D from './Scene3D';
import Navigation from './Navigation';
import Lenis from 'lenis';

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

    // ---------------------------------------------------------
    // SCENE TRANSITION LOGIC (PHASE 1 -> TRANSITION -> PHASE 2)
    // ---------------------------------------------------------
    // 0px - 800px:   Phase 1 Active (Gate)
    // 800px - 1200px: Transition (Phase 1 Fades Out, Phase 2 Fades In)
    // 1200px+:       Phase 2 Active (Obsidian Shore)

    // Phase 1: Visual Degradation (Blur + Contrast Drop + Fade Out)
    const opacityS1 = useTransform(scrollY, [800, 1150], [1, 0]);
    const blurS1 = useTransform(scrollY, [800, 1150], ["blur(0px)", "blur(10px)"]);
    const scaleS1 = useTransform(scrollY, [800, 1150], [1, 1.05]);
    // Hide Phase 1 completely after transition to prevent ghosting
    const displayS1 = useTransform(scrollY, (y) => y > 1200 ? 'none' : 'block');

    // Phase 2: "The Obsidian Shore" (Visual Emergence)
    // Starts fading in at 900px, fully visible by 1200px
    const opacityS2 = useTransform(scrollY, [900, 1200], [0, 1]);

    // Phase 1 Text Logic (Staggered Fade Out)
    const opacityTextTitle = useTransform(scrollY, [0, 300], [1, 0]);
    const opacityTextSubMiddle = useTransform(scrollY, [200, 500], [1, 0]);
    const opacityTextLastLine = useTransform(scrollY, [600, 900], [1, 0]);

    // Toggle Pointer Events
    const pointerEventsS1 = useTransform(scrollY, (y) => y < 1000 ? 'auto' : 'none');
    const pointerEventsS2 = useTransform(scrollY, (y) => y > 1000 ? 'auto' : 'none');

    // Navigation & Logo Transforms
    const navTop = useTransform(scrollY, [0, 400], isMobile ? ["20%", "20%"] : ["40%", "50%"]);
    const navLeft = useTransform(scrollY, [0, 400], isMobile ? ["0%", "0%"] : ["50%", "5%"]);
    const navTranslateX = useTransform(scrollY, [0, 400], [isMobile ? "0%" : "-50%", isMobile ? "0%" : "0%"]);
    const navScale = useTransform(scrollY, [0, 400], [1, 0.8]);

    // ---------------------------------------------------------
    // PHASE 2 PARALLAX LOGIC (OBSIDIAN SHORE)
    // ---------------------------------------------------------
    // Scroll Mapping: 1200px (Start) -> 2500px (End of Section)

    // Sand Base: Moves slowly upwards (yPercent: 10 equivalent)
    // Translating Y from 0% to -5% (Visual drift)
    const ySand = useTransform(scrollY, [1200, 2500], ["0%", "-5%"]);

    // Water Overlay: Moves faster upwards (yPercent: -20 equivalent)
    // Translating Y from 0% to -15% (Gliding effect)
    const yWater = useTransform(scrollY, [1200, 2500], ["0%", "-15%"]);

    // Water Scale: Subtle zoom (1 -> 1.1)
    const scaleWater = useTransform(scrollY, [1200, 2500], [1, 1.1]);

    // Text Reveal (Right Panel)
    const textRevealY = useTransform(scrollY, [1100, 1400], [50, 0]);
    const textRevealOpacity = useTransform(scrollY, [1100, 1400], [0, 1]);


    // Mouse Parallax Logic (Phase 1 Only)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);
    const xGate = useTransform(springX, [-0.5, 0.5], [60, -60]);
    const yGate = useTransform(springY, [-0.5, 0.5], [25, -25]);
    const xParallaxBG = useTransform(springX, [-0.5, 0.5], [15, -15]);
    const yParallaxBG = useTransform(springY, [-0.5, 0.5], [5, -5]);

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

    useEffect(() => {
        const loadAssets = async () => {
            const criticalImages = [
                '/assets/logo-man.webp',
                '/assets/logo-text.svg',
                '/assets/noise.png',
                '/assets/hero/bg.webp',
                '/assets/hero/mountains_back.webp',
                '/assets/hero/volcano-main.webp',
                '/assets/hero/foreground.webp',
                // Phase 2 Assets (New)
                '/assets/beach/sand_base.webp',
                '/assets/beach/water_overlay.webp'
            ];
            const animFrames = Array.from({ length: 39 }, (_, i) => `/assets/logo-animation/${i + 1}.webp`);
            let loadedCount = 0;
            const total = criticalImages.length + animFrames.length;

            const updateProgress = () => {
                loadedCount++;
                const newProgress = Math.round((loadedCount / total) * 100);
                setProgress(newProgress);
            };

            const loadImage = (src: string) => {
                return new Promise<void>((resolve) => {
                    const img = new Image();
                    img.src = src;
                    img.onload = () => { updateProgress(); resolve(); };
                    img.onerror = () => { updateProgress(); resolve(); };
                });
            };
            await Promise.all([...criticalImages, ...animFrames].map(src => loadImage(src)));
        };
        loadAssets();
    }, []);

    useEffect(() => {
        if (progress === 100) setTimeout(() => setLoading(false), 500);
    }, [progress]);

    return (
        <div className={`relative z-0 w-full bg-[#050505] ${loading ? 'h-screen overflow-hidden' : 'min-h-[250vh]'}`}>

            <div className="fixed inset-0 z-[100] pointer-events-none">
                {/* HEADER - LOGO */}
                <motion.div
                    className="absolute top-0 left-0 w-full flex justify-center items-start pt-0 md:pt-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.0, delay: 0.5 }}
                >
                    <div className="relative w-full flex justify-center items-center">
                        <div className="relative w-[180px] h-[70px] md:w-[150px] md:h-[75px] flex items-center justify-center">
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center pt-0 md:pt-0"
                                animate={!loading ? { opacity: 1, y: 0 } : { opacity: isMobile ? 1 : 0, y: isMobile ? 0 : 0 }}
                            >
                                <img src="/assets/logo-text.svg" alt="Esat Can Travel" className="w-full h-full object-contain z-10 opacity-100" />
                            </motion.div>
                        </div>
                        {isMobile && !loading && (
                            <motion.div
                                className="absolute right-4 top-4 pointer-events-auto mix-blend-difference text-white"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div onClick={() => setMenuOpen(true)} className="cursor-pointer">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                    </svg>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* MENU OVERLAY */}
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center pointer-events-auto"
                            initial={{ opacity: 0, y: '-100%' }}
                            animate={{ opacity: 1, y: '0%' }}
                            exit={{ opacity: 0, y: '-100%' }}
                            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                        >
                            <div className="absolute top-8 right-8 cursor-pointer text-white p-2" onClick={() => setMenuOpen(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <div className="flex flex-col gap-8 text-center">
                                {["Beaches", "Volcanoes", "Animals", "Culture", "Gastronomy", "Islands"].map((item, i) => (
                                    <motion.div
                                        key={item}
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + (i * 0.1), duration: 0.5 }}
                                        className="text-4xl font-serif text-[#E5E0D8] cursor-pointer hover:text-orange-500 transition-colors"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        {item}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* NAVIGATION */}
                {!loading && (
                    <motion.div
                        className="absolute pointer-events-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.0, delay: 2.8 }}
                        style={{
                            top: navTop,
                            left: navLeft,
                            x: navTranslateX,
                            scale: navScale,
                            transformOrigin: isMobile ? "top left" : "top left"
                        }}
                    >
                        <Navigation isMobile={isMobile} />
                    </motion.div>
                )}

                {/* LOADING LOGO */}
                <motion.div className="fixed inset-0 z-[101] pointer-events-none">
                    <motion.div
                        className="absolute left-1/2 flex items-center justify-center pointer-events-auto"
                        initial={{ top: '50%', y: '-50%', x: '-50%', width: '300px', height: '300px' }}
                        animate={!loading
                            ? {
                                top: '4%',
                                y: '0%',
                                width: isMobile ? '90px' : '75px',
                                height: isMobile ? '35px' : '38px',
                                left: '50%',
                                x: '-50%',
                            }
                            : { top: '50%', y: '-50%', x: '-50%', width: isMobile ? '180px' : '300px', height: isMobile ? '180px' : '300px' }
                        }
                        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                    >
                        <LogoAnimator loading={loading} progress={progress} isMobile={isMobile} />
                    </motion.div>
                </motion.div>
            </div>


            {/* ======================================================================== */}
            {/* SCENE COMPOSITOR (Fixed Container)                                       */}
            {/* ======================================================================== */}
            <div className="fixed inset-0 w-full h-screen overflow-hidden pointer-events-none">

                {/* ------------------------------------------------------------------ */}
                {/* SCENE 1: THE GATE (Phase 1)                                        */}
                {/* ------------------------------------------------------------------ */}
                <motion.div
                    className="absolute inset-0 w-full h-full"
                    style={{
                        opacity: opacityS1,
                        pointerEvents: pointerEventsS1,
                        filter: blurS1,
                        scale: scaleS1,
                        display: displayS1
                    }}
                >
                    <div className="absolute inset-0 -z-[10] bg-[#050505]" />
                    <div className="absolute inset-0 z-[5] mix-blend-overlay opacity-20">
                        <div className="absolute inset-0 bg-repeat opacity-50" style={{ backgroundImage: 'url(/assets/noise.png)', backgroundSize: '200px' }} />
                    </div>

                    <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-10" style={{ x: xParallaxBG, y: yParallaxBG }}>
                        <img src="/assets/hero/bg.webp" className="w-full h-full object-cover opacity-80" alt="Sky" />
                    </motion.div>
                    <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-20" style={{ x: xParallaxBG, y: yParallaxBG }}>
                        <img src="/assets/hero/mountains_back.webp" className="w-full h-full object-cover transform scale-125 -translate-y-[15%] md:scale-100 md:translate-y-0 origin-center" alt="Mountains" />
                    </motion.div>
                    <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-30" style={{ x: xParallaxBG, y: yParallaxBG }}>
                        <img src="/assets/hero/volcano-main.webp" className="w-full h-full object-cover object-[70%] md:object-center" alt="Volcano" />
                        <motion.div
                            className="absolute top-[40%] left-[50%] w-[100px] h-[100px] bg-orange-600 blur-[60px] rounded-full mix-blend-screen -z-10"
                            animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.2, 1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            style={{ x: "-50%", y: "-50%" }}
                        />
                    </motion.div>
                    {!loading && (
                        <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-40" style={{ x: xGate, y: yGate }}>
                            <Scene3D zIndex={40} mouse={{ x: springX, y: springY }} isMobile={isMobile} />
                        </motion.div>
                    )}
                    <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-50 pointer-events-none" style={{ x: xParallaxBG, y: yParallaxBG }}>
                        <img src="/assets/hero/foreground.webp" className="w-full h-full object-cover transform scale-125 md:scale-100 origin-bottom" alt="Foreground" />
                    </motion.div>

                    <motion.div className="absolute inset-0 flex flex-col items-start justify-end pl-[5%] pb-[10%] md:pb-[5%] z-[60] pointer-events-none">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: !loading ? 1 : 0 }} transition={{ duration: 2.0, delay: 1.5, ease: "easeOut" }} className="flex flex-col items-start">
                            <motion.h1 className="font-[family-name:var(--font-cormorant)] italic font-light text-[12vw] md:text-[6vw] leading-[1.1] text-[#E5E0D8]" style={{ opacity: opacityTextTitle }}>
                                Travel deeper.
                            </motion.h1>
                            <div className="mt-2 md:mt-4 font-[family-name:var(--font-cormorant)] text-lg md:text-2xl text-[#E5E0D8]/80 italic">
                                <motion.p className="leading-relaxed" style={{ opacity: opacityTextSubMiddle }}>
                                    Not faster. <br /> Not louder.
                                </motion.p>
                                <motion.p className="leading-relaxed text-[#E5E0D8]" style={{ opacity: opacityTextLastLine }}>
                                    Just deeper.
                                </motion.p>
                            </div>
                        </motion.div>
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-[55]" />
                </motion.div>


                {/* ------------------------------------------------------------------ */}
                {/* SCENE 2: THE OBSIDIAN SHORE (Phase 2)                              */}
                {/* ------------------------------------------------------------------ */}
                {/* Split Screen Layout */}
                <motion.div
                    className="absolute inset-0 w-full h-full flex flex-col md:flex-row bg-[#000000] z-[100]"
                    style={{ opacity: opacityS2, pointerEvents: pointerEventsS2 }}
                >
                    {/* LEFT PANEL: VISUALS (50%) */}
                    <div className="w-full md:w-1/2 h-[50vh] md:h-full relative overflow-hidden bg-black">
                        {/* Sand Base (Bottom Layer) - Parallax Slow */}
                        <motion.div
                            className="absolute inset-[-10%] w-[120%] h-[120%] z-10"
                            style={{ y: ySand }}
                        >
                            <img
                                src="/assets/beach/sand_base.webp"
                                className="w-full h-full object-cover"
                                alt="Obsidian Sand"
                            />
                        </motion.div>

                        {/* Water Overlay (Top Layer) - Parallax Fast + Zoom + Continuous Sway */}
                        <motion.div
                            className="absolute inset-[-10%] w-[120%] h-[120%] z-20 mix-blend-screen opacity-100"
                            style={{ y: yWater, scale: scaleWater }}
                            animate={{
                                x: ["-1%", "1%", "-1%"],
                                scale: [1, 1.05, 1]
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <img
                                src="/assets/beach/water_overlay.webp"
                                className="w-full h-full object-cover"
                                alt="Azure Tide"
                            />
                        </motion.div>

                        {/* Overlay Gradient for Text Readability if needed (Subtle) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-30 pointer-events-none" />
                    </div>

                    {/* RIGHT PANEL: TYPOGRAPHY (50%) */}
                    <div className="w-full md:w-1/2 h-[50vh] md:h-full bg-[#f8f5f2] flex flex-col justify-center items-center md:items-start p-10 md:p-20 text-center md:text-left z-40 relative">
                        <div className="absolute inset-0 bg-[#f8f5f2] z-0" /> {/* Ensure solid background behind text */}
                        <motion.div
                            style={{ y: textRevealY, opacity: textRevealOpacity }}
                            className="flex flex-col gap-6 z-10"
                        >
                            <h2 className="font-serif text-5xl md:text-7xl text-[#1a1a1a] leading-[1.1] tracking-widest font-bold">
                                THE <br /> OBSIDIAN <br /> SHORE
                            </h2>
                            <div className="w-12 h-[1px] bg-[#1a1a1a]/20 mx-auto md:mx-0" />
                            <p className="font-sans text-[#1a1a1a]/60 text-sm md:text-base tracking-widest uppercase">
                                Where volcanic ash meets the azure tide
                            </p>
                        </motion.div>
                    </div>

                </motion.div>

            </div>

            {/* Scroll Spacer */}
            <div className="h-[250vh]" />
        </div >
    );
}

const LogoAnimator = ({ loading, progress, isMobile }: { loading: boolean, progress: number, isMobile: boolean }) => {
    // Generate Keyframes for CSS Animation
    const generateKeyframes = () => {
        let css = `@keyframes logoLoop {`;
        const totalFrames = 39;
        const totalSteps = (totalFrames * 2) - 2;

        for (let step = 0; step <= totalSteps; step++) {
            const percentage = (step / totalSteps) * 100;
            let frame;
            if (step < totalFrames) {
                frame = step + 1;
            } else {
                frame = totalFrames - (step - totalFrames) - 1;
            }
            if (frame < 1) frame = 1;

            css += `
                ${percentage}% { background-image: url('/assets/logo-animation/${frame}.webp'); }`;
        }
        css += `}`;
        return css;
    };

    const [isPlaying, setIsPlaying] = useState(false);
    const [shouldStop, setShouldStop] = useState(false);

    const handleMouseEnter = () => {
        if (!loading) {
            setIsPlaying(true);
            setShouldStop(false);
        }
    };

    const handleMouseLeave = () => {
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
                    animation: logoLoop 2s steps(1) infinite;
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
                            x: '-50%',
                        }
                        : {
                            scale: 1.8,
                            top: '50%',
                            y: '-50%',
                            x: '-40%',
                            width: isMobile ? '180px' : '300px',
                            height: isMobile ? '180px' : '300px'
                        }
                }
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
                <div className="relative w-full h-full">
                    <motion.div className="absolute inset-0 opacity-20">
                        <img src="/assets/logo-man.webp" alt="Ghost Logo" className="w-full h-full object-contain" />
                    </motion.div>

                    <motion.div
                        className="absolute inset-0 overflow-hidden"
                        animate={{ clipPath: loading ? `inset(${100 - progress}% 0 0 0)` : 'inset(0% 0 0 0)' }}
                        transition={{ clipPath: { duration: 0.1, ease: "linear" } }}
                    >
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
        </div>
    );
};
