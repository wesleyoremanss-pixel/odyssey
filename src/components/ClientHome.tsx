'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import IntroAnimation from './IntroAnimation';
// import Beaches from '@/components/Beaches';
// import Volcanoes from '@/components/Volcanoes';
// import Animals from '@/components/Animals';
// import Culture from '@/components/Culture';

export default function ClientHome() {

  useEffect(() => {
    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    }
  }, []);

  return (
    <main className="relative min-h-screen font-sans bg-white dark:bg-[#0a0a0a]">
      <IntroAnimation />

      {/* Second Section - Revealed after Intro */}
      <div id="second-section" className="relative z-10 w-full min-h-screen pointer-events-none">
        {/* Placeholder Content - Now Transparent, sits on top of Fixed Portal BG */}
        <div className="w-full h-screen flex items-center justify-center text-white relative pointer-events-auto">
          <h2 className="text-4xl font-serif">Welcome to the Dark Side</h2>
        </div>

        {/*
        <Beaches />
        <Volcanoes />
        <Animals />
        <Culture />
        */}

        <footer className="py-20 text-center text-neutral-500 text-sm relative z-20">
          <p>© 2026 Esat Can Travel. Winter Edition.</p>
        </footer>
      </div>
    </main>
  );
}
