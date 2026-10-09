// Colon line-break — inside [data-colon-break], turns "Label: value" into
// "Label:<br> value". Idempotent: elements are marked once processed.
// Ported from hamounbv/pomp js/pomp.js §4. Supersedes the registered
// Webflow script colon_break-1.0.0.js (to be removed at cutover).
function process(el: Element) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  const nodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) {
    if ((n.nodeValue ?? '').indexOf(': ') !== -1) nodes.push(n as Text);
  }
  nodes.forEach((node) => {
    const parts = (node.nodeValue ?? '').split(': ');
    if (parts.length < 2) return;
    const frag = document.createDocumentFragment();
    parts.forEach((p, i) => {
      if (i > 0) {
        frag.appendChild(document.createTextNode(':'));
        frag.appendChild(document.createElement('br'));
        frag.appendChild(document.createTextNode(' '));
      }
      frag.appendChild(document.createTextNode(p));
    });
    node.parentNode?.replaceChild(frag, node);
  });
}

export function initColonBreak() {
  document
    .querySelectorAll('[data-colon-break]:not([data-colon-break-done])')
    .forEach((el) => {
      process(el);
      el.setAttribute('data-colon-break-done', '1');
    });
}
