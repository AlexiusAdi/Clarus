"use client";

import { useCallback, useRef } from "react";

/**
 * vaul's iOS scroll-lock (usePositionFixed in node_modules/vaul) pins the
 * page with `position: fixed; top: -scrollY` when a drawer opens, plus a
 * "bottom bar reappeared" compensation that only engages once scrollY has
 * passed one viewport height. That compensation miscalculates the pinned
 * offset on real iPhones, desyncing touch coordinates from what's rendered
 * inside the drawer — taps on the lower half of the sheet silently miss
 * (emilkowalski/vaul#374, still open upstream). Jumping to the top before
 * vaul captures the scroll position sidesteps it, and restoring it once the
 * drawer closes keeps the user's place on the page.
 *
 * `wrapSetOpen` takes a drawer's raw `useState` setter and returns a
 * drop-in replacement — use it for every path that opens or closes the
 * drawer (the trigger's onClick, the Drawer's onOpenChange, and any
 * onSuccess/cancel callback that closes it), not just one of them, since
 * vaul only calls `onOpenChange` for its own swipe/backdrop dismissal and
 * not for state changes driven from outside.
 */
export function useDrawerScrollFix() {
  const savedScrollY = useRef<number | null>(null);

  const wrapSetOpen = useCallback(
    (setOpen: (open: boolean) => void) => (open: boolean) => {
      if (typeof window !== "undefined") {
        if (open) {
          if (window.scrollY >= window.innerHeight) {
            savedScrollY.current = window.scrollY;
            window.scrollTo(0, 0);
          }
        } else if (savedScrollY.current !== null) {
          window.scrollTo(0, savedScrollY.current);
          savedScrollY.current = null;
        }
      }
      setOpen(open);
    },
    [],
  );

  return { wrapSetOpen };
}
