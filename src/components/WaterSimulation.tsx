'use client';

import { Stage, Container, Sprite, useTick, useApp } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { useMemo, useRef, useState, useEffect } from 'react';

// Main Water Simulation Component
const WaterSimulation = () => {
    // Stage Dimensions
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const resize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full">
            <Stage
                width={dimensions.width}
                height={dimensions.height}
                options={{ backgroundAlpha: 0, antialias: true }}
            >
                <WaterEffect width={dimensions.width} height={dimensions.height} />
            </Stage>
        </div>
    );
};

const WaterEffect = ({ width, height }: { width: number, height: number }) => {
    const app = useApp();

    // 1. Create Displacement Texture & Sprites
    const displacementSprite1 = useRef<PIXI.Sprite>(null);
    const displacementSprite2 = useRef<PIXI.Sprite>(null);

    // Load texture (assuming it wraps)
    const displacementTexture = useMemo(() => {
        const tex = PIXI.Texture.from('/assets/beach/displacement_map_repeat.jpg');
        tex.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
        return tex;
    }, []);

    // 2. Filters
    const filters = useMemo(() => {
        const d1 = new PIXI.DisplacementFilter(null as any); // Temp, will set sprite ref later
        const d2 = new PIXI.DisplacementFilter(null as any);

        // Scale controls the intensity of the distortion
        d1.scale.set(50);
        d2.scale.set(30);

        return [d1, d2];
    }, []);

    // 3. Animation Loop
    useTick((delta) => {
        if (displacementSprite1.current && displacementSprite2.current) {
            // Move sprites to create flow
            displacementSprite1.current.x += 1 * delta;
            displacementSprite1.current.y += 0.5 * delta;

            displacementSprite2.current.x -= 0.8 * delta;
            displacementSprite2.current.y += 0.8 * delta;

            // Reset position to keep numbers small (optional due to repeat wrap)
            // But seamless repeating texture handles this automatically via UVs usually.
        }
    });

    // 4. Update Filter Sprites Reference (React-Pixi quirck, sometimes needs explicit set)
    useEffect(() => {
        if (displacementSprite1.current && displacementSprite2.current) {
            // @ts-ignore
            filters[0].maskSprite = displacementSprite1.current;
            // @ts-ignore
            filters[1].maskSprite = displacementSprite2.current;
        }
    }, [filters]);

    // Calculate Aspect Ratio Corrected Scales (Cover)
    const bgScale = Math.max(width / 1920, height / 1080); // Assuming 1080p source images

    return (
        <Container>
            {/* DISPLACEMENT MAPS (Hidden/Utility) */}
            <Sprite
                ref={displacementSprite1}
                texture={displacementTexture}
                width={width} // Stretch to cover or tile? Tiling is better for repeat.
                height={height}
                // TilingSprite in pure Pixi is better, but Sprite with repeat wrap works if UVs shift. 
                // However, moving the sprite itself moves the texture map.
                anchor={0.5}
                x={width / 2}
                y={height / 2}
                // Make texture repeat by scaling sprite up? No, use texture scale.
                scale={{ x: 2, y: 2 }}
                // We render them but they are used as filters. They don't need to be visible? 
                // In Pixi V7 DisplacementFilter takes a sprite. That sprite must be in the stage (renderable) for v7? 
                // Actually usually you can simply update the sprite's position.
                renderable={false} // Important: Don't show the map itself
            />
            <Sprite
                ref={displacementSprite2}
                texture={displacementTexture}
                anchor={0.5}
                x={width / 2}
                y={height / 2}
                scale={{ x: 1.5, y: 1.5 }}
                renderable={false}
            />

            {/* CONTENT LAYERS */}
            {/* Sand Base (Static) */}
            <Sprite
                image="/assets/beach/sand_base.webp"
                anchor={0.5}
                x={width / 2}
                y={height / 2}
                scale={{ x: bgScale, y: bgScale }}
            />

            {/* Water Overlay (Distorted) */}
            <Sprite
                image="/assets/beach/water_overlay.webp"
                anchor={0.5}
                x={width / 2}
                y={height / 2}
                scale={{ x: bgScale * 1.05, y: bgScale * 1.05 }} // Slight overscale
                filters={filters}
                alpha={0.9} // Transparency for blending
            />
        </Container>
    );
};

export default WaterSimulation;
