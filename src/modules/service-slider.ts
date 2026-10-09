// Service slider — one Swiper per .service-slider-w wrapper, navigation
// scoped inside that wrapper. Ported from hamounbv/pomp js/pomp.js §1.
//
// Swiper is bundled (pnpm, swiper@11) instead of the swiper-bundle CDN tag:
// only the core plus the Navigation and Autoplay modules this slider uses,
// and A11y, which the CDN bundle switched on by default (aria-labels on the
// arrows and the live-region .swiper-notification) — kept for 1:1 parity.
// Loop and Observer are part of Swiper core.
import Swiper from 'swiper';
import { A11y, Autoplay, Navigation } from 'swiper/modules';
import type { SwiperOptions } from 'swiper/types';

export function initServiceSliders() {
  document.querySelectorAll<HTMLElement>('.service-slider-w').forEach((wrap) => {
    const el = wrap.querySelector<HTMLElement & { swiper?: Swiper }>('.swiper');
    if (!el || el.swiper) return; // nothing to mount, or already mounted

    // Options are copied verbatim from the live code. addSlidesBefore/After
    // are not top-level Swiper params (they belong under `virtual: {}`), so
    // Swiper ignores them here — exactly as it does on live. Kept for
    // parity; the cast lets them through the types.
    const options = {
      modules: [Navigation, Autoplay, A11y],
      observer: true,
      observeParents: true,
      spaceBetween: 24,
      loop: true,
      autoplay: { delay: 2000 },
      speed: 800,
      centeredSlides: true,
      addSlidesAfter: 2,
      addSlidesBefore: 2,
      slidesPerView: 'auto',
      navigation: {
        nextEl: wrap.querySelector<HTMLElement>('.swiper-next'),
        prevEl: wrap.querySelector<HTMLElement>('.swiper-prev'),
      },
    } as SwiperOptions;

    new Swiper(el, options);
  });
}
