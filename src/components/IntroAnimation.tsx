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
    // 0px - 600px:   Phase 1 Active (Gate)
    // 600px - 1400px: Transition (Detailed breakdown below)
    // 1400px+:       Phase 2 Active (Beaches)

    // Phase 1: Visual Degradation (Blur + Contrast Drop + Cool Color)
    // Starts fading OUT visually around 800px, fully gone by 1200px
    const opacityS1 = useTransform(scrollY, [800, 1150], [1, 0]);
    const blurS1 = useTransform(scrollY, [800, 1150], ["blur(0px)", "blur(10px)"]);
    const contrastS1 = useTransform(scrollY, [800, 1150], ["contrast(100%)", "contrast(80%)"]);
    const scaleS1 = useTransform(scrollY, [800, 1150], [1, 1.05]); // "Nefes alır gibi genişler"

    // Explicitly hide Phase 1 when scrolled past 1200px to prevent ghosting
    const displayS1 = useTransform(scrollY, (y) => y > 1200 ? 'none' : 'block');

    // Phase 2: Visual Emergence
    // Starts fading IN earlier (700px), fully visible by 1100px so it's ready when text starts
    const opacityS2 = useTransform(scrollY, [700, 1100], [0, 1]);

    // Phase 1 Text Logic (Staggered Fade Out)
    // 1. "Travel deeper" (Main Title) -> Fades out fast (0-300px)
    const opacityTextTitle = useTransform(scrollY, [0, 300], [1, 0]);
    // 2. "Not faster. Not louder." (Subtext Lines 1-2) -> Fades out med (200-500px)
    const opacityTextSubMiddle = useTransform(scrollY, [200, 500], [1, 0]);
    // 3. "Just deeper." (Subtext Last Line) -> Fades out LAST (600-900px)
    // Overlaps with Phase 2 start (800px)
    const opacityTextLastLine = useTransform(scrollY, [600, 900], [1, 0]);

    // Toggle Pointer Events
    const pointerEventsS1 = useTransform(scrollY, (y) => y < 1000 ? 'auto' : 'none');
    const pointerEventsS2 = useTransform(scrollY, (y) => y > 1000 ? 'auto' : 'none'); // Increased interaction range for S2

    // UI State (Logo Scaling, Nav)
    const navTop = useTransform(scrollY, [0, 400], isMobile ? ["20%", "20%"] : ["40%", "50%"]);
    const navLeft = useTransform(scrollY, [0, 400], isMobile ? ["0%", "0%"] : ["50%", "5%"]);
    const navTranslateX = useTransform(scrollY, [0, 400], [isMobile ? "0%" : "-50%", isMobile ? "0%" : "0%"]);
    const navScale = useTransform(scrollY, [0, 400], [1, 0.8]);

    // Mouse Parallax Logic
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    // Parallax Transforms (Applied to Phase 2 Layers)
    // "Ön katmanlar daha çok, arka katmanlar neredeyse hiç"
    const p2_Sky = useTransform(springX, [-0.5, 0.5], [2, -2]); // Very minimal
    const p2_Mount = useTransform(springX, [-0.5, 0.5], [5, -5]); // Minimal
    const p2_Sea = useTransform(springX, [-0.5, 0.5], [10, -10]); // Subtle
    const p2_Sand = useTransform(springX, [-0.5, 0.5], [20, -20]); // Noticeable
    const p2_Trees = useTransform(springX, [-0.5, 0.5], [35, -35]); // Most movement

    // Gate Parallax (Existing)
    const xGate = useTransform(springX, [-0.5, 0.5], [60, -60]);
    const yGate = useTransform(springY, [-0.5, 0.5], [25, -25]);
    const xParallaxBG = useTransform(springX, [-0.5, 0.5], [15, -15]); // S1 BG
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
            // 1. Define Assets
            const criticalImages = [
                '/assets/logo-man.webp',
                '/assets/logo-text.svg',
                '/assets/noise.png',
                '/assets/hero/bg.webp',
                '/assets/hero/mountains_back.webp',
                '/assets/hero/volcano-main.webp',
                '/assets/hero/foreground.webp',
                // Phase 2 Assets
                '/assets/beach/sky_back.webp',
                '/assets/beach/distant_mountains.webp',
                '/assets/beach/sea_back.webp',
                '/assets/beach/sand.webp',
                '/assets/beach/trees.webp',
                '/assets/beach/base_fill.webp'
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
        if (progress === 100) {
            setTimeout(() => setLoading(false), 500);
        }
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
                        filter: blurS1,  // Applies blur + contrast drop
                        scale: scaleS1,   // Subtle breathing expansion
                        display: displayS1 // Force hide when out of view
                    }}
                >
                    {/* Background Color */}
                    <div className="absolute inset-0 -z-[10] bg-[#050505]" />

                    {/* Noise */}
                    <div className="absolute inset-0 z-[5] mix-blend-overlay opacity-20">
                        <div className="absolute inset-0 bg-repeat opacity-50" style={{ backgroundImage: 'url(/assets/noise.png)', backgroundSize: '200px' }} />
                    </div>

                    {/* S1: Sky (Z-10) */}
                    <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-10" style={{ x: xParallaxBG, y: yParallaxBG }}>
                        <img src="/assets/hero/bg.webp" className="w-full h-full object-cover opacity-80" alt="Sky" />
                    </motion.div>

                    {/* S1: Mountains (Z-20) */}
                    <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-20" style={{ x: xParallaxBG, y: yParallaxBG }}>
                        <img src="/assets/hero/mountains_back.webp" className="w-full h-full object-cover transform scale-125 -translate-y-[15%] md:scale-100 md:translate-y-0 origin-center" alt="Mountains" />
                    </motion.div>

                    {/* S1: Volcano (Z-30) */}
                    <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-30" style={{ x: xParallaxBG, y: yParallaxBG }}>
                        <img src="/assets/hero/volcano-main.webp" className="w-full h-full object-cover object-[70%] md:object-center" alt="Volcano" />
                        <motion.div
                            className="absolute top-[40%] left-[50%] w-[100px] h-[100px] bg-orange-600 blur-[60px] rounded-full mix-blend-screen -z-10"
                            animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.2, 1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            style={{ x: "-50%", y: "-50%" }}
                        />
                    </motion.div>

                    {/* S1: 3D Gate (Z-40) */}
                    {
                        !loading && (
                            <motion.div
                                className="absolute inset-[-5%] w-[110%] h-[110%] z-40"
                                style={{
                                    x: xGate,
                                    y: yGate,
                                    // Apply contrast filter here too if needed, but parent filter handles it
                                }}
                            >
                                <Scene3D zIndex={40} mouse={{ x: springX, y: springY }} isMobile={isMobile} />
                            </motion.div>
                        )
                    }

                    {/* S1: Foreground (Z-50) */}
                    <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-50 pointer-events-none" style={{ x: xParallaxBG, y: yParallaxBG }}>
                        <img src="/assets/hero/foreground.webp" className="w-full h-full object-cover transform scale-125 md:scale-100 origin-bottom" alt="Foreground" />
                    </motion.div>

                    {/* S1: Text (Z-60) - Staggered Fade */}
                    <motion.div
                        className="absolute inset-0 flex flex-col items-start justify-end pl-[5%] pb-[10%] md:pb-[5%] z-[60] pointer-events-none"
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: !loading ? 1 : 0 }}
                            transition={{ duration: 2.0, delay: 1.5, ease: "easeOut" }}
                            className="flex flex-col items-start"
                        >
                            {/* Main Title: Travel deeper. */}
                            <motion.h1
                                className="font-[family-name:var(--font-cormorant)] italic font-light text-[12vw] md:text-[6vw] leading-[1.1] text-[#E5E0D8]"
                                style={{ opacity: opacityTextTitle }}
                            >
                                Travel deeper.
                            </motion.h1>

                            {/* Subtext Wrapper */}
                            <div className="mt-2 md:mt-4 font-[family-name:var(--font-cormorant)] text-lg md:text-2xl text-[#E5E0D8]/80 italic">
                                {/* Lines 1-2: Not faster. Not louder. */}
                                <motion.p
                                    className="leading-relaxed"
                                    style={{ opacity: opacityTextSubMiddle }}
                                >
                                    Not faster. <br />
                                    Not louder.
                                </motion.p>

                                {/* Line 3: Just deeper. (Last to fade) */}
                                <motion.p
                                    className="leading-relaxed text-[#E5E0D8]"
                                    style={{ opacity: opacityTextLastLine }}
                                >
                                    Just deeper.
                                </motion.p>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Gradient Overlay (Phase 1 specific) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-[55]" />
                </motion.div>


                {/* ------------------------------------------------------------------ */}
                {/* SCENE 2: BEACHES (Phase 2)                                         */}
                {/* ------------------------------------------------------------------ */}
                <motion.div
                    className="absolute inset-0 w-full h-full bg-[#0c4a6e]"
                    style={{ opacity: opacityS2, pointerEvents: pointerEventsS2 }}
                >
                    {/* S2: Background (Z-10) - sky_back */}
                    <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-10" style={{ x: p2_Sky, y: 0 }}>
                        <img src="/assets/beach/sky_back.webp" className="w-full h-full object-cover" alt="Sky" />
                    </motion.div>

                    {/* S2: Far Layer (Z-20) - distant_mountains */}
                    <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-20" style={{ x: p2_Mount, y: 0 }}>
                        <img src="/assets/beach/distant_mountains.webp" className="w-full h-full object-cover" alt="Mountains" />
                    </motion.div>

                    {/* S2: Mid Layer (Z-30) - sea_back */}
                    <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-30" style={{ x: p2_Sea, y: 0 }}>
                        <img src="/assets/beach/sea_back.webp" className="w-full h-full object-cover" alt="Sea" />
                    </motion.div>

                    {/* S2: Near Layer (Z-40) - sand */}
                    <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-40" style={{ x: p2_Sand, y: 0 }}>
                        <img src="/assets/beach/sand.webp" className="w-full h-full object-cover" alt="Sand" />
                    </motion.div>

                    {/* S2: Foreground (Z-50) - trees */}
                    <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-50 pointer-events-none" style={{ x: p2_Trees, y: 0 }}>
                        <img src="/assets/beach/trees.webp" className="w-full h-full object-cover" alt="Trees" />
                    </motion.div>

                    {/* S2: Text (Z-60) - Kinetic Typography */}
                    {/* Position: Bottom-Right (Fix) */}
                    <motion.div
                        className="absolute inset-0 flex flex-col items-end justify-end pr-[5%] pb-[10%] z-[60] pointer-events-none text-right"
                    >
                        <div className="flex flex-col items-end">
                            <h2 className="font-serif text-5xl md:text-6xl text-white mb-4 leading-tight">
                                <KineticText text="Space is not" scrollY={scrollY} start={900} end={1400} className="block" />
                                <KineticText text="static here." scrollY={scrollY} start={1000} end={1500} className="block" />
                            </h2>
                            <div className="text-white/80 text-lg md:text-xl font-light tracking-wide max-w-xl italic">
                                <KineticText
                                    text="Even time is part of the depth."
                                    scrollY={scrollY}
                                    start={1100}
                                    end={1600}
                                    className=""
                                />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll Spacer - Controls the speed of the intro animation */}
            <div className="h-[250vh]" />
        </div >
    );
}

// Kinetic Text Component
// Simplified to ensure visibility
const KineticText = ({ text, scrollY, start, end, className }: { text: string, scrollY: MotionValue<number>, start: number, end: number, className?: string }) => {
    const words = text.split(" ");
    return (
        <span className={className}>
            {words.map((word, i) => {
                // Simplified Stagger:
                // Start a bit staggered, but ensure sufficient overlap
                const step = 50;
                const wordStart = start + (i * step);
                // Make the transition quick but the hold long
                const wordEnd = wordStart + 200;

                const opacity = useTransform(scrollY, [wordStart, wordEnd], [0, 1]);
                const y = useTransform(scrollY, [wordStart, wordEnd], [40, 0]);
                const blur = useTransform(scrollY, [wordStart, wordEnd], ["blur(8px)", "blur(0px)"]);

                return (
                    <motion.span
                        key={i}
                        style={{ opacity, y, filter: blur }}
                        className="inline-block mr-[0.25em]"
                    >
                        {word}
                    </motion.span>
                );
            })}
        </span>
    );
};

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
