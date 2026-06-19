import { useEffect, useRef } from 'react';

/**
 * Animated "tech" background: a constellation / neural-network of nodes that
 * drift and connect with lines. It is GPU-light (2D canvas), respects
 * prefers-reduced-motion, and reacts to scroll (parallax + density fade).
 *
 * Used behind the hero as a guaranteed-cool visual even when no <video> asset
 * is present. Fully self-contained — no external dependencies.
 */
interface TechBackgroundProps {
  className?: string;
  /** 0..1 — how strongly scroll affects parallax/fade. */
  scrollFactor?: number;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function TechBackground({ className, scrollFactor = 1 }: TechBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    // Non-null locals so TypeScript keeps the narrowing inside nested closures.
    const cv: HTMLCanvasElement = canvas;
    const ctx: CanvasRenderingContext2D = context;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes: Node[] = [];
    let scrollY = window.scrollY;
    const mouse = { x: -9999, y: -9999 };

    const ACCENT = [108, 92, 231]; // #6C5CE7
    const CYAN = [0, 210, 255]; // #00D2FF

    function resize() {
      width = cv.clientWidth;
      height = cv.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.floor(width * dpr);
      cv.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density scales with area but is capped for performance.
      const count = Math.min(110, Math.floor((width * height) / 14000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
      }));
    }

    function lineColor(t: number, alpha: number) {
      const r = Math.round(ACCENT[0] + (CYAN[0] - ACCENT[0]) * t);
      const g = Math.round(ACCENT[1] + (CYAN[1] - ACCENT[1]) * t);
      const b = Math.round(ACCENT[2] + (CYAN[2] - ACCENT[2]) * t);
      return `rgba(${r},${g},${b},${alpha})`;
    }

    const MAX_DIST = 130;

    function frame() {
      ctx.clearRect(0, 0, width, height);

      // Scroll-driven fade: background gently dims as the user scrolls past.
      const fade = Math.max(0, 1 - (scrollY / Math.max(height, 1)) * 0.9 * scrollFactor);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Subtle attraction toward the pointer for interactivity.
        const dxm = mouse.x - n.x;
        const dym = mouse.y - n.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < 160) {
          n.x += (dxm / dm) * 0.4;
          n.y += (dym / dm) * 0.4;
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < MAX_DIST) {
            const t = (a.x / width + b.x / width) / 2;
            const alpha = (1 - dist / MAX_DIST) * 0.5 * fade;
            ctx.strokeStyle = lineColor(t, alpha);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        ctx.fillStyle = lineColor(n.x / width, 0.85 * fade);
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    const onScroll = () => {
      scrollY = window.scrollY;
    };
    const onMouse = (e: MouseEvent) => {
      const rect = cv.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll, { passive: true });
    cv.addEventListener('mousemove', onMouse);
    cv.addEventListener('mouseleave', onLeave);

    if (reduced) {
      // Draw a single static frame for users who prefer reduced motion.
      frame();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    } else {
      rafRef.current = requestAnimationFrame(frame);
    }

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      cv.removeEventListener('mousemove', onMouse);
      cv.removeEventListener('mouseleave', onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scrollFactor]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
