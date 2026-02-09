I have prepared two high-res WebP assets for a 'Parallax Hero Section' representing an Indonesian beach. I need you to build a React component (using Next.js App Router syntax) with Tailwind CSS and GSAP ScrollTrigger.

The Assets (located in /public/assets/beaches/):

sand_base.webp (Bottom Layer): The static black volcanic sand texture.

water_overlay.webp (Top Layer): Transparent turquoise water foam.

The Design Layout:

Create a Split-Screen Layout:

Left Side (50% width): The visual container. It must have relative, overflow-hidden, and h-screen.

Right Side (50% width): Minimalist white space with high-end typography (H1: 'THE OBSIDIAN SHORE', Sub: 'Where volcanic ash meets the azure tide').

The Animation (The Critical Part):

Use useGSAP hook for safe execution.

Parallax Effect: As the user scrolls down, I want the water_overlay to move vertically faster than the sand_base.

sand_base: Move slightly (yPercent: 10 or similar).

water_overlay: Move significantly (yPercent: -20 or similar) to create a 'gliding' depth effect.

Subtle Zoom: Add a very slow, subtle scale-up animation (scale: 1.1) to the water layer as we scroll, to make it feel alive.

Ensure the images are absolutely positioned with object-fit: cover to fill the left panel completely without distortion. 