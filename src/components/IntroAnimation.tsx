'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, useGLTF } from '@react-three/drei';
import { useEffect, useState, useRef, Suspense } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import { Gate3D } from './Gate3D';
import { Scene3D } from './Scene3D';
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
    // SCENE TRANSITION LOGIC (CROSS-FADE)
    // ---------------------------------------------------------
    // 0px - 800px:   Scene 1 Active (Gate)
    // 800px - 1400px: Transition (S1 Fades Out, S2 Fades In)
    // 1400px+:       Scene 2 Active (Beaches)

    // Smooth Cross-Fade
    const opacityS1 = useTransform(scrollY, [800, 1200], [1, 0]);
    const opacityS2 = useTransform(scrollY, [800, 1200], [0, 1]);

    // Toggle Pointer Events to ensure S2 is interactive when visible
    const pointerEventsS1 = useTransform(scrollY, (y) => y < 1000 ? 'auto' : 'none');
    const pointerEventsS2 = useTransform(scrollY, (y) => y > 1000 ? 'auto' : 'none');

    // UI State (Logo Scaling, Nav)
    const navTop = useTransform(scrollY, [0, 400], isMobile ? ["20%", "20%"] : ["40%", "50%"]);
    const navLeft = useTransform(scrollY, [0, 400], isMobile ? ["0%", "0%"] : ["50%", "5%"]);
    const navTranslateX = useTransform(scrollY, [0, 400], [isMobile ? "0%" : "-50%", isMobile ? "0%" : "0%"]);
    const navScale = useTransform(scrollY, [0, 400], [1, 0.8]);

    // Mouse Parallax Logic (Shared by both scenes)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    // Parallax Transforms (Applied to layers in both scenes for consistency)
    const xParallax1 = useTransform(springX, [-0.5, 0.5], [15, -15]);
    const yParallax1 = useTransform(springY, [-0.5, 0.5], [5, -5]);

    const xParallax2 = useTransform(springX, [-0.5, 0.5], [25, -25]);
    const yParallax2 = useTransform(springY, [-0.5, 0.5], [10, -10]);

    const xParallax3 = useTransform(springX, [-0.5, 0.5], [45, -45]);
    const yParallax3 = useTransform(springY, [-0.5, 0.5], [20, -20]);

    const xParallax4 = useTransform(springX, [-0.5, 0.5], [70, -70]);
    const yParallax4 = useTransform(springY, [-0.5, 0.5], [30, -30]);

    // Gate Parallax
    const xGate = useTransform(springX, [-0.5, 0.5], [60, -60]);
    const yGate = useTransform(springY, [-0.5, 0.5], [25, -25]);

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
                '/assets/hero/foreground.webp'
            ];
            // const glbAsset = '/assets/bali-gate.glb';
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
                    img.onload = () => {
                        updateProgress();
                        resolve();
                    };
                    img.onerror = () => {
                        // console.error(`Failed to preload image: ${src}`);
                        updateProgress();
                        resolve();
                    };
                });
            };

            // 2. Load Critical First (Parallel)
            await Promise.all(criticalImages.map(src => loadImage(src)));

            // 3. Load Animation Frames (Parallel, but after Critical)
            await Promise.all(animFrames.map(src => loadImage(src)));
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

            {/* ------------------------------------------- */}
            {/* GLOBAL UI (Z-100) - ALWAYS ON TOP           */}
            {/* ------------------------------------------- */}
            <div className="fixed inset-0 z-[100] pointer-events-none">
                {/* HEADER */}
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

                {/* Menu Overlay */}
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

                {/* Navigation (Sticky/Parallax behavior maintained via useTransform) */}
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

                {/* Loading / Transition Logo */}
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
                {/* SCENE 1: THE GATE (Opacity controlled by scroll)                   */}
                {/* ------------------------------------------------------------------ */}
                <motion.div
                    className="absolute inset-0 w-full h-full"
                    style={{ opacity: opacityS1, pointerEvents: pointerEventsS1 }}
                >
                    {/* Background Color */}
                    <div className="absolute inset-0 -z-[10] bg-[#050505]" />

                    {/* Noise */}
                    <div className="absolute inset-0 z-[5] mix-blend-overlay opacity-20">
                        <div className="absolute inset-0 bg-repeat opacity-50" style={{ backgroundImage: 'url(/assets/noise.png)', backgroundSize: '200px' }} />
                    </div>

                    {/* S1: Sky (Z-10) */}
                    <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-10" style={{ x: xParallax1, y: yParallax1 }}>
                        <img src="/assets/hero/bg.webp" className="w-full h-full object-cover opacity-80" alt="Sky" />
                    </motion.div>

                    {/* S1: Mountains (Z-20) */}
                    <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-20" style={{ x: xParallax2, y: yParallax2 }}>
                        <img src="/assets/hero/mountains_back.webp" className="w-full h-full object-cover transform scale-125 -translate-y-[15%] md:scale-100 md:translate-y-0 origin-center" alt="Mountains" />
                    </motion.div>

                    {/* S1: Volcano (Z-30) */}
                    <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-30" style={{ x: xParallax3, y: yParallax3 }}>
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
                                    y: yGate
                                }}
                            >
                                <Scene3D zIndex={40} mouse={{ x: springX, y: springY }} isMobile={isMobile} />
                            </motion.div>
                        )
                    }

                    {/* S1: Foreground (Z-50) */}
                    <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-50 pointer-events-none" style={{ x: xParallax4, y: yParallax4 }}>
                        <img src="/assets/hero/foreground.webp" className="w-full h-full object-cover transform scale-125 md:scale-100 origin-bottom" alt="Foreground" />
                    </motion.div>

                    {/* S1: Text (Z-60) */}
                    <motion.div
                        className="absolute inset-0 flex flex-col items-start justify-end pl-[5%] pb-[10%] md:pb-[5%] z-[60] pointer-events-none"
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: !loading ? 1 : 0 }}
                            transition={{ duration: 2.0, delay: 1.5, ease: "easeOut" }}
                        >
                            <h1 className="font-[family-name:var(--font-cormorant)] italic font-light text-[12vw] md:text-[6vw] leading-[1.1] text-[#E5E0D8]">
                                Travel deeper.
                            </h1>
                            <p className="mt-2 md:mt-4 font-[family-name:var(--font-cormorant)] text-lg md:text-2xl text-[#E5E0D8]/80 italic">
                                Not faster. Not louder. Just deeper.
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-[55]" />
                </motion.div>


                {/* ------------------------------------------------------------------ */}
                {/* SCENE 2: BEACHES (Opacity controlled by scroll)                    */}
                {/* ------------------------------------------------------------------ */}
                <motion.div
                    className="absolute inset-0 w-full h-full bg-[#0c4a6e]"
                    style={{ opacity: opacityS2, pointerEvents: pointerEventsS2 }}
                >
                    {/* S2: Background (Z-10) - Placeholder */}
                    <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-10" style={{ x: xParallax1, y: yParallax1 }}>
                        <div className="w-full h-full bg-gradient-to-b from-[#0f172a] to-[#082f49] opacity-80" />
                        {/* <img src="/assets/beaches/layer1-sky.webp" ... /> */}
                    </motion.div>

                    {/* S2: Far Layer (Z-20) - Placeholder */}
                    <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-20" style={{ x: xParallax2, y: yParallax2 }}>
                        {/* <img src="/assets/beaches/layer2-far.webp" ... /> */}
                    </motion.div>

                    {/* S2: Mid Layer (Z-30) - Placeholder */}
                    <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-30" style={{ x: xParallax3, y: yParallax3 }}>
                        {/* Visual indicator for Mid Layer */}
                        {/* <img src="/assets/beaches/layer3-mid.webp" ... /> */}
                    </motion.div>

                    {/* S2: Near Layer (Z-40) - Placeholder */}
                    <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-40" style={{ x: xParallax3, y: yParallax3 }}>
                        {/* <img src="/assets/beaches/layer4-near.webp" ... /> */}
                    </motion.div>

                    {/* S2: Foreground (Z-50) - Placeholder */}
                    <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] z-50 pointer-events-none" style={{ x: xParallax4, y: yParallax4 }}>
                        {/* Visual indicator for Foreground */}
                        {/* <img src="/assets/beaches/layer5-foreground.webp" ... /> */}
                    </motion.div>

                    {/* S2: Text (Z-60) */}
                    <motion.div
                        className="absolute inset-0 flex flex-col items-center justify-center text-center z-[60] pointer-events-none"
                    >
                        <div>
                            <h2 className="font-serif text-5xl md:text-7xl text-white mb-6">
                                Nothing rushes here.
                            </h2>
                            <p className="text-white/80 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto italic">
                                And you don't have to, either.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>

            </div>

            {/* Scroll Spacer - Controls the speed of the intro animation */}
            <div className="h-[250vh]" />
        </div >
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
