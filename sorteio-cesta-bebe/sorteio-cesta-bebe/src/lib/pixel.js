export const DEFAULT_META_PIXEL_ID = '1735980434763367';

let loadedId = '';

export function loadPixel(id = DEFAULT_META_PIXEL_ID) {
  const pixelId = String(id || DEFAULT_META_PIXEL_ID).trim();
  if (!pixelId || typeof window === 'undefined' || typeof document === 'undefined') return;

  if (loadedId === pixelId && window.fbq) {
    window.fbq('consent', 'grant');
    return;
  }

  if (!window.fbq) {
    const fbq = function () {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
      else fbq.queue.push(arguments);
    };
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    window.fbq = fbq;
    window._fbq = fbq;
  }

  if (!document.querySelector('script[data-meta-pixel]')) {
    const script = document.createElement('script');
    script.dataset.metaPixel = '1';
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }

  window.fbq('consent', 'grant');
  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
  loadedId = pixelId;
}

export function revokePixel() {
  try {
    if (typeof window !== 'undefined' && window.fbq) window.fbq('consent', 'revoke');
  } catch {
    // A falha de rastreamento não deve afetar o funcionamento do site.
  }
}

export function track(event, params = {}, custom = false) {
  try {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq(custom ? 'trackCustom' : 'track', event, params);
    }
  } catch {
    // A falha de rastreamento não deve afetar o funcionamento do site.
  }
}
