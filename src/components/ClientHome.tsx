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

      <div className="relative z-10">
        {/* IntroAnimation now handles the transition to Beaches internally */}
        {/* <Beaches /> */}

        {/* 
        <Volcanoes />
        <Animals />
        <Culture /> 
        */}

        <footer className="py-20 text-center text-neutral-500 text-sm relative z-20 bg-black">
          <p>© 2026 Esat Can Travel. Winter Edition.</p>
        </footer>
      </div>
    </main>
  );
}
