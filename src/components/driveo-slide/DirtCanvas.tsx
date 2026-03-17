'use client';

import { useRef, useEffect, useCallback } from 'react';

interface DirtCanvasProps {
  imageUrl: string;
  dirtLevel: number; // 0-10
  width?: number;
  height?: number;
}

/**
 * DirtCanvas — Renders a car image with progressive dirt overlay
 *
 * Uses HTML Canvas with multiply blend mode to layer dirt textures:
 * - Layer 1: Car image (always visible)
 * - Layer 2: Light dust film (visible from level 1+)
 * - Layer 3: Heavy dirt patches (visible from level 4+)
 * - Layer 4: Mud splatters (visible from level 7+)
 *
 * Dirt textures are generated procedurally using canvas patterns
 * to avoid needing external texture PNG files for MVP.
 */
export function DirtCanvas({ imageUrl, dirtLevel, width = 480, height = 320 }: DirtCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const carImageRef = useRef<HTMLImageElement | null>(null);

  const generateDustPattern = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, density: number) => {
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < density) {
        const brown = 80 + Math.random() * 60;
        data[i] = brown + 40;     // R
        data[i + 1] = brown + 20; // G
        data[i + 2] = brown - 10; // B
        data[i + 3] = Math.random() * 100 + 30; // A
      } else {
        data[i + 3] = 0; // transparent
      }
    }
    return imageData;
  }, []);

  const generateDirtSpots = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const radius = Math.random() * 20 + 5;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(90, 60, 30, ${Math.random() * 0.4 + 0.1})`);
      gradient.addColorStop(0.7, `rgba(70, 50, 25, ${Math.random() * 0.2})`);
      gradient.addColorStop(1, 'rgba(60, 40, 20, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
  }, []);

  const generateMudSplatters = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = h * 0.4 + Math.random() * h * 0.6; // mostly bottom half
      const radius = Math.random() * 30 + 10;

      ctx.beginPath();
      // Irregular shape
      for (let a = 0; a < Math.PI * 2; a += 0.3) {
        const r = radius * (0.6 + Math.random() * 0.8);
        const px = x + Math.cos(a) * r;
        const py = y + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(60, 40, 15, ${Math.random() * 0.5 + 0.2})`;
      ctx.fill();
    }
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const img = carImageRef.current;
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Layer 1: Car image
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    if (dirtLevel === 0) return;

    // Layer 2: Light dust film (level 1+)
    ctx.globalCompositeOperation = 'multiply';
    const dustOpacity = Math.min(dirtLevel / 10, 0.7);
    ctx.fillStyle = `rgba(160, 130, 90, ${dustOpacity * 0.3})`;
    ctx.fillRect(0, 0, width, height);

    // Layer 2b: Dust particles
    ctx.globalCompositeOperation = 'source-over';
    const dustDensity = dirtLevel * 0.008;
    const dustData = generateDustPattern(ctx, width, height, dustDensity);
    ctx.putImageData(dustData, 0, 0);
    // Re-draw car underneath
    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(img, 0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';

    // Layer 3: Dirt spots (level 4+)
    if (dirtLevel >= 4) {
      ctx.globalAlpha = Math.min((dirtLevel - 3) / 7, 0.8);
      const spotCount = Math.floor((dirtLevel - 3) * 8);
      generateDirtSpots(ctx, width, height, spotCount);
      ctx.globalAlpha = 1;
    }

    // Layer 4: Mud splatters (level 7+)
    if (dirtLevel >= 7) {
      ctx.globalAlpha = Math.min((dirtLevel - 6) / 4, 0.9);
      const mudCount = Math.floor((dirtLevel - 6) * 5);
      generateMudSplatters(ctx, width, height, mudCount);
      ctx.globalAlpha = 1;
    }

    // Layer 5: Overall darkening for extreme dirt (level 8+)
    if (dirtLevel >= 8) {
      ctx.globalCompositeOperation = 'multiply';
      const darken = (dirtLevel - 7) * 0.05;
      ctx.fillStyle = `rgba(80, 60, 40, ${darken})`;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
    }
  }, [dirtLevel, width, height, generateDustPattern, generateDirtSpots, generateMudSplatters]);

  // Load car image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      carImageRef.current = img;
      render();
    };
    img.onerror = () => {
      // Fallback to placeholder if external image fails (CORS etc.)
      const fallback = new Image();
      fallback.onload = () => {
        carImageRef.current = fallback;
        render();
      };
      fallback.src = '/car-placeholder.svg';
    };
    img.src = imageUrl;
  }, [imageUrl, render]);

  // Re-render when dirt level changes
  useEffect(() => {
    render();
  }, [render]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/50">
      <canvas
        ref={canvasRef}
        style={{ width, height }}
        className="w-full h-auto max-w-full"
      />
    </div>
  );
}
