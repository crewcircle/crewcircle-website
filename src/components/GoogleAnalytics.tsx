'use client';

import { useEffect } from 'react';

interface WindowWithDataLayer extends Window {
  dataLayer?: unknown[];
}

export default function GoogleAnalytics() {
  useEffect(() => {
      (function(w: WindowWithDataLayer, d: Document, s: string, i: string) {
        if (!w.dataLayer) {
          w.dataLayer = [];
        }
        w.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        const f = d.getElementsByTagName(s)[0];
        const j = d.createElement(s) as HTMLScriptElement;
        j.async = true;
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i;
        if (f && f.parentNode) {
          f.parentNode.insertBefore(j, f);
        }
      })(window as WindowWithDataLayer, document, 'script', 'GTM-XXXXXXX');
  }, []);

  return null;
}
