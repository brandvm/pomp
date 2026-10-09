// Hero video guard. Ported from hamounbv/pomp js/pomp.js §5.
//
// The hero video is a full-viewport element with no painted background of
// its own, so a source that stalls or fails leaves the top of the page
// black. src/styles.css §05 (hero ground) paints the brand ground behind
// it; this adds the behavioural half: retry a blocked autoplay once, and if
// no frame has decoded within 6s, mark the wrapper so the fallback is
// unmistakable. Marking is additive — it never hides a video that is
// merely slow.
export function initHeroVideoGuard() {
  document
    .querySelectorAll<HTMLVideoElement>('.home-hero-default-bg video')
    .forEach((video) => {
      const wrap = video.closest('.home-hero-default-bg') || video.parentElement;

      const settle = () => {
        if (video.readyState >= 2 && video.videoWidth > 0) {
          wrap?.setAttribute('data-hero-video', 'ok');
          return true;
        }
        return false;
      };

      // Some browsers refuse autoplay even when muted; ask once, quietly.
      const nudge = () => {
        if (!video.paused) return;
        video.muted = true; // property, not just the attribute
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      };

      video.addEventListener('loadeddata', settle, { once: true });
      video.addEventListener('canplay', nudge, { once: true });
      video.addEventListener('error', () =>
        wrap?.setAttribute('data-hero-video', 'failed')
      );

      nudge();

      window.setTimeout(() => {
        if (!settle()) wrap?.setAttribute('data-hero-video', 'failed');
      }, 6000);
    });
}
