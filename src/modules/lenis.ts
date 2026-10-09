// Lenis smooth scrolling. Ported from hamounbv/pomp js/pomp.js §2.
//
// Lenis is bundled (pnpm, lenis@1.1.5 — the version live pinned on the CDN).
// The instance is exposed as window.lenis so other modules can scroll
// through it. Never runs inside the Webflow Editor.
import Lenis, { type LenisOptions } from 'lenis';

export function initLenis() {
  if (window.Webflow?.env?.('editor')) return; // never run inside the Editor
  if (window.lenis) return; // already initialised

  // Options copied verbatim from the live code. direction, gestureDirection,
  // smooth, mouseMultiplier and smoothTouch are pre-1.0 option names that
  // Lenis 1.1.5 ignores (live behaves the same way); kept for parity.
  const options = {
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  } as LenisOptions;

  const lenis = new Lenis(options);
  window.lenis = lenis;

  // GSAP and ScrollTrigger are Webflow globals (not bundled); guard both.
  if (typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
  }

  if (typeof gsap !== 'undefined') {
    gsap.ticker.add((time: number) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else {
    // No GSAP on this page — drive Lenis from its own rAF loop instead.
    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }
}
