'use client';

// Re-trigger build
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Navigation from './Navigation';
import Scene3D from './Scene3D';
import ExplosionTransition from './ExplosionTransition';

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

    // Gate Interaction Progress (0 to 1 over 800px scroll)
    const gateProgress = useTransform(scrollY, [0, 800], [0, 1]);

    // Volcano Blur (Sync with scroll)
    const blurVolcano = useTransform(scrollY, [0, 600], ["blur(0px)", "blur(12px)"]);
    const opacityVolcano = useTransform(scrollY, [0, 600], [1, 0.4]);

    // SCROLL-DRIVEN TRANSITION LOGIC
    // 1. Explosion Progress: Starts at 85% of scroll, ends at 100%
    const explosionProgress = useTransform(gateProgress, [0.85, 1], [0, 1]);

    // 2. Intro Opacity: Fades out as explosion happens (reveals underlying 2nd section)
    const introOpacity = useTransform(gateProgress, [0.9, 1], [1, 0]);

    // 3. Pointer Events: Disable intro interactions when transition starts
    const introPointerEvents = useTransform(gateProgress, (v) => v > 0.9 ? 'none' : 'auto');


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
            const glbAsset = '/assets/bali-gate.glb';
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
                        console.error(`Failed to preload image: ${src}`);
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

    // 4. Portal Expansion Logic (Circle Clip Path)
    // Starts small (0%) at 0.85, expands to full (150% to cover corners) at 1.0
    const portalRadius = useTransform(gateProgress, [0.85, 1], ["0%", "150%"]);
    const portalClipPath = useTransform(portalRadius, (r) => `circle(${r} at 50% 50%)`);

    // UI doesn't fade, but might move/scale.
    // Ensure UI is visible over the portal.

    return (
        <div className={`relative z-0 w-full bg-[#050505] ${loading ? 'h-screen overflow-hidden' : 'min-h-[200vh]'}`}>

            {/* 1. FLASH EFFECT (Z-60) - On top of Intro, but under UI */}
            <ExplosionTransition progress={explosionProgress} />

            {/* 2. PORTAL LAYER (Z-50) - reveals bg-dark inside the explosion */}
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden pointer-events-none"
                style={{ clipPath: portalClipPath }}
            >
                <div className="relative w-full h-full">
                    <img src="/assets/bg-dark.webp" className="absolute inset-0 w-full h-full object-cover" alt="Dark Portal" />
                    {/* Optional: Add content that exists in the dark world here if needed immediately */}
                </div>
            </motion.div>


            {/* 3. PERSISTENT UI LAYER (Z-100) - Menu follows page */}
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
                            transformOrigin: isMobile ? "top left" : "top left",
                            opacity: isMobile ? opacityScrollText : 1
                        }}
                    >
                        {/* Note: opacityScrollText currently fades out text on scroll. 
                             If user wants menu to follow page, we might need to DISABLE this opacity fade 
                             or update standard Nav to be fixed after intro. 
                             For now, I keep the props but ensure it's rendered in this persistent layer. */ }
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


            {/* 4. INTRO SCENE LAYER (Z-0) - Fades Out */}
            <motion.div
                className="fixed inset-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center z-0"
                style={{
                    opacity: introOpacity,
                    pointerEvents: introPointerEvents
                }}
            >
                {/* Base Background Color */}
                <div className="absolute inset-0 -z-[100] bg-[#050505]" />

                {/* Grainy Gradient */}
                <div className="absolute inset-0 z-[100] pointer-events-none mix-blend-overlay opacity-20">
                    <div
                        className="absolute inset-0 bg-repeat opacity-50"
                        style={{ backgroundImage: 'url(/assets/noise.png)', backgroundSize: '200px' }}
                    />
                </div>

                {/* PARALLAX LAYERS (Back to Front) - Positive Z-Indexes */}

                {/* 1. Sky (z-10) */}
                <motion.div
                    className="absolute inset-[-5%] w-[110%] h-[110%] z-10"
                    style={{ x: xSky, y: ySky }}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: !loading ? 1.0 : 1.1 }}
                    transition={{ duration: 3.0, delay: 1.0 }}
                >
                    <img src="/assets/hero/bg.webp" className="w-full h-full object-cover opacity-80" alt="Background Sky" />
                </motion.div>

                {/* 2. Mountains (z-20) */}
                <motion.div
                    className="absolute inset-[-5%] w-[110%] h-[110%] z-20"
                    style={{ x: xMountain, y: yMountain }}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: !loading ? 0 : 30, opacity: !loading ? 1 : 0 }}
                    transition={{ duration: 2.2, delay: 1.2 }}
                >
                    <img src="/assets/hero/mountains_back.webp" className="w-full h-full object-cover transform scale-125 -translate-y-[15%] md:scale-100 md:translate-y-0 origin-center" alt="Mountain Back" />
                </motion.div>

                {/* 3. Volcano (z-30) */}
                <motion.div
                    className="absolute inset-[-5%] w-[110%] h-[110%] z-30"
                    style={{
                        x: xVolcano,
                        y: yVolcano,
                        filter: blurVolcano,
                        opacity: opacityVolcano
                    }}
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
                        {/* PASS SCROLL PROGRESS TO 3D SCENE */}
                        <Scene3D zIndex={40} scrollProgress={gateProgress} isMobile={isMobile} />
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

            </motion.div>
            {/* Scroll Spacer - Controls the speed of the intro animation */}
            <div className="h-[200vh]" />
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
