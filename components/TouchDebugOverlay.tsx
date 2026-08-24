"use client";

import { useEffect, useState } from "react";

/**
 * Temporary on-screen diagnostic for the iOS Safari "can't tap inside the
 * drawer after the keyboard opens" bug. Enable with ?debug=1 in the URL.
 * Safe to delete once the bug is diagnosed.
 *
 * Touch events and viewport-resize events are logged into separate buffers
 * — the keyboard-open/close animation fires a burst of resize events that
 * would otherwise flood a single shared log and push out the one touch
 * event that actually matters.
 *
 * A periodic poll independently checks whether document.elementFromPoint()
 * at the submit button's own center actually resolves to the button. This
 * catches a CSS-covering-the-button problem (something else intercepting
 * the tap) even when no touch event fires at all, which a purely
 * event-driven log can't do.
 */
export function TouchDebugOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [touchLines, setTouchLines] = useState<string[]>([]);
  const [vvLines, setVvLines] = useState<string[]>([]);
  const [pollLines, setPollLines] = useState<string[]>([]);

  useEffect(() => {
    setEnabled(new URLSearchParams(window.location.search).has("debug"));
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const logTouch = (line: string) =>
      setTouchLines((prev) => [...prev.slice(-13), line]);
    const logVv = (line: string) =>
      setVvLines((prev) => [...prev.slice(-3), line]);
    const logPoll = (line: string) =>
      setPollLines((prev) => [...prev.slice(-5), line]);

    const describe = (el: Element | null) => {
      if (!el) return "none";
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : "";
      const cls =
        el.className && typeof el.className === "string"
          ? `.${el.className.trim().split(/\s+/).slice(0, 2).join(".")}`
          : "";
      const text = el.textContent?.trim().slice(0, 20) ?? "";
      return `${tag}${id}${cls} "${text}"`;
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const el = document.elementFromPoint(t.clientX, t.clientY);
      logTouch(
        `↓ (${Math.round(t.clientX)},${Math.round(t.clientY)}) → ${describe(el)}`,
      );
    };

    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (!t) return;
      const el = document.elementFromPoint(t.clientX, t.clientY);
      logTouch(
        `↑ (${Math.round(t.clientX)},${Math.round(t.clientY)}) → ${describe(el)}`,
      );
    };

    const vv = window.visualViewport;
    let wasShrunk = false;
    const onVVResize = () => {
      if (!vv) return;
      const shrunk = vv.height < window.innerHeight - 40;
      if (shrunk !== wasShrunk) {
        logVv(
          `⇕ ${shrunk ? "keyboard opened" : "keyboard closed"}: vvH=${Math.round(vv.height)} innerH=${window.innerHeight} scrollY=${Math.round(window.scrollY)} offsetTop=${Math.round(vv.offsetTop)}`,
        );
        wasShrunk = shrunk;
      }
    };

    document.addEventListener("touchstart", onTouchStart, {
      capture: true,
      passive: true,
    });
    document.addEventListener("touchend", onTouchEnd, {
      capture: true,
      passive: true,
    });
    vv?.addEventListener("resize", onVVResize);

    let lastMismatch: boolean | null = null;
    const poll = window.setInterval(() => {
      const btn = document.querySelector(
        '[data-slot="drawer-content"] button[type="submit"]',
      ) as HTMLElement | null;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const hit = document.elementFromPoint(cx, cy);
      const isMismatch = !(hit === btn || btn.contains(hit));
      if (isMismatch !== lastMismatch) {
        if (isMismatch) {
          const style = getComputedStyle(btn);
          logPoll(
            `✗ MISMATCH at button center (${Math.round(cx)},${Math.round(cy)}) → ${describe(hit)}`,
          );
          logPoll(
            `  btn rect: top=${Math.round(rect.top)} bottom=${Math.round(rect.bottom)} | pos=${style.position} z=${style.zIndex} pe=${style.pointerEvents} opacity=${style.opacity}`,
          );
        } else {
          logPoll(`✓ ok — button center hit-tests to itself again`);
        }
        lastMismatch = isMismatch;
      }
    }, 400);

    return () => {
      document.removeEventListener("touchstart", onTouchStart, {
        capture: true,
      });
      document.removeEventListener("touchend", onTouchEnd, { capture: true });
      vv?.removeEventListener("resize", onVVResize);
      window.clearInterval(poll);
    };
  }, [enabled]);

  if (!enabled) return null;

  const allLines = [
    ...vvLines,
    ...pollLines,
    "── touches ──",
    ...touchLines,
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999999,
        background: "rgba(0,0,0,0.85)",
        color: "#0f0",
        fontFamily: "monospace",
        fontSize: "9px",
        lineHeight: 1.4,
        padding: "4px 6px",
        maxHeight: "45vh",
        overflowY: "auto",
        pointerEvents: "none",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
      }}
    >
      {allLines.join("\n")}
    </div>
  );
}
