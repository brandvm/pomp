import type Lenis from 'lenis';

export {};

// Emitted by Webflow on every page (Site settings → GSAP / jQuery), NOT
// bundled. Declared loosely; always guard with `typeof X !== 'undefined'`.
interface GsapTickerLike {
  add(callback: (time: number, deltaTime: number, frame: number) => void): void;
  lagSmoothing(threshold: number, adjustedLag?: number): void;
}

declare global {
  const gsap: { ticker: GsapTickerLike; [key: string]: any };
  const ScrollTrigger: { update: (...args: any[]) => void; [key: string]: any };
  const jQuery: any;
  const $: any;

  interface Window {
    // The Lenis instance, exposed by src/modules/lenis.ts.
    lenis?: Lenis;
    WFC?: {
      staging: boolean;
      dev: boolean;
      devBase: string;
      stag: string;
      // The pinned release tag from the head snippet, or null before the
      // first release.
      release: string | null;
      // Base URL production loads from: the jsDelivr tag, or staging while
      // release is null.
      prod: string;
      // Set before script execution, including when a fallback URL is used.
      source?: string;
    };
    Webflow?: { env?: (mode: string) => boolean };
  }
}
