import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import { TechBackground } from './TechBackground';

/**
 * Full-bleed landing hero.
 *
 * Layers (back -> front):
 *   1. Animated <TechBackground> canvas (always present, scroll-reactive).
 *   2. Optional looping <video> (drop an MP4 at /public/hero.mp4 to enable it).
 *      If the asset is missing it silently fails and the canvas shows through.
 *   3. Scroll-reactive gradient wash + vignette for depth and legibility.
 *   4. Headline, copy and CTAs.
 */
export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasVideo, setHasVideo] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      // Parallax content + drive a gradient hue shift via a CSS variable.
      setOffset(y);
      document.documentElement.style.setProperty(
        '--scroll-hue',
        String(Math.round((y / 12) % 360)),
      );
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const fade = Math.max(0, 1 - offset / 600);

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden"
      style={{ minHeight: 'clamp(560px, 92vh, 900px)' }}
    >
      {/* 1. Animated tech canvas */}
      <TechBackground className="absolute inset-0 -z-30 h-full w-full" />

      {/* 2. Optional looping video */}
      {hasVideo && (
        <video
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-40 mix-blend-screen"
          autoPlay
          muted
          loop
          playsInline
          poster=""
          onError={() => setHasVideo(false)}
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
      )}

      {/* 3. Scroll-reactive gradient + vignette */}
      <div className="hero-gradient absolute inset-0 -z-10" />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 0%, transparent 40%, rgba(10,10,15,0.6) 80%, var(--bg-primary) 100%)',
        }}
      />

      {/* 4. Content */}
      <div
        className="relative mx-auto flex min-h-[inherit] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center"
        style={{ transform: `translateY(${offset * 0.15}px)`, opacity: fade }}
      >
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-card/60 px-4 py-1.5 text-xs font-medium text-text-secondary backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-accent-secondary" />
          Earn loyalty points on every order
        </span>

        <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          <span className="text-text-primary">Premium tech,</span>
          <br />
          <span className="bg-gradient-to-r from-accent-primary via-[#8b5cf6] to-accent-secondary bg-clip-text text-transparent">
            elevated rewards.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
          Discover flagship laptops, smartphones, audio and more — curated for
          performance. Every purchase climbs your Fidelity tier for richer perks
          and bigger savings.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <a href="#catalog" className="btn-primary px-7 py-3 text-base">
            Shop the catalog
            <ArrowRight className="h-4 w-4" />
          </a>
          <Link to="/register" className="btn-secondary px-7 py-3 text-base">
            Join &amp; earn rewards
          </Link>
        </div>
      </div>

      {/* Scroll cue */}
      <a
        href="#featured"
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-text-secondary/70 transition-colors hover:text-text-primary"
        style={{ opacity: fade }}
        aria-label="Scroll to featured products"
      >
        <ChevronDown className="h-6 w-6 animate-bounce" />
      </a>
    </section>
  );
}
