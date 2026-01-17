'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import IntroAnimation from '@/components/IntroAnimation';

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

      {/* Content Section Placeholder */}
      <section className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 pointer-events-none opacity-50">
        <p className="font-serif text-2xl">Scroll for more</p>
      </section>
    </main>
  );
}
