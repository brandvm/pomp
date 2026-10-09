// Nav shrink on scroll — toggles .is-shrunk on the nav wrappers once the
// page is scrolled past 5vh. Ported from hamounbv/pomp js/pomp.js §3.
// CSS: src/styles.css §05 (.s-g-navigation.is-shrunk).
export function initNavShrink() {
  const targets = document.querySelectorAll<HTMLElement>(
    '.g-navigation-w, .s-g-navigation, .sw-g-nav'
  );
  if (!targets.length) return;

  const getThresholdPx = () => window.innerHeight * 0.05; // 5vh
  let thresholdPx = getThresholdPx();

  const update = () => {
    const shouldShrink = window.scrollY >= thresholdPx;
    targets.forEach((el) => el.classList.toggle('is-shrunk', shouldShrink));
  };

  const onResize = () => {
    thresholdPx = getThresholdPx();
    update();
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
}
