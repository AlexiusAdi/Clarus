"use client";

import { useEffect } from "react";

/**
 * WebKit has a long-standing bug (webkit.org/b/192564, open since iOS 12)
 * where dismissing the on-screen keyboard on a page with
 * `viewport-fit=cover` leaves the page's touch hit-testing region desynced
 * from what's actually rendered — the layout looks back to normal, but taps
 * on the lower part of the screen stop reaching the page's JS entirely
 * (confirmed here: a document-level capture-phase touch listener saw
 * nothing at all for taps that should have landed on visible buttons).
 * `viewport-fit=cover` can't be dropped — it's what makes
 * `env(safe-area-inset-*)` report real values (see app/layout.tsx). The
 * known workaround is nudging the scroll position once the keyboard closes,
 * which forces WebKit to recompute its hit-testing offset.
 */
export function IOSKeyboardResyncFix() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    let wasShrunk = false;
    const onResize = () => {
      const shrunk = vv.height < window.innerHeight - 40;
      if (wasShrunk && !shrunk) {
        const y = window.scrollY;
        window.scrollTo(0, y + 1);
        requestAnimationFrame(() => window.scrollTo(0, y));
      }
      wasShrunk = shrunk;
    };

    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

  return null;
}
