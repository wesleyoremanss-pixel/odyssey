'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import IntroAnimation from '@/components/IntroAnimation';
// import Beaches from '@/components/Beaches';
// import Volcanoes from '@/components/Volcanoes';
// import Animals from '@/components/Animals';
// import Culture from '@/components/Culture';

export default function Home() {

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

      {/* Content Sections - Temporarily Disabled
      <div className="relative z-10 w-full bg-white dark:bg-[#0a0a0a]">
        <Beaches />
        <Volcanoes />
        <Animals />
        <Culture />

        <footer className="py-20 text-center text-neutral-500 text-sm">
          <p>© 2026 Esat Can Travel. Winter Edition.</p>
        </footer>
      </div>
      */}
    </main>
  );
}
