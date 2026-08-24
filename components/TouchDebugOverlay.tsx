"use client";

import { useEffect, useState } from "react";

/**
 * Temporary on-screen diagnostic for the iOS Safari "can't tap inside the
 * drawer after the keyboard opens" bug. Two vaul-internal fixes made no
 * difference, so instead of guessing again this logs, right on the screen
 * (no Mac/Web Inspector needed), what element every touch actually landed
 * on and what the viewport/body looked like at that moment. Enable with
 * ?debug=1 in the URL. Safe to delete once the bug is diagnosed.
 */
export function TouchDebugOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    setEnabled(new URLSearchParams(window.location.search).has("debug"));
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const log = (line: string) => {
      setLines((prev) => [...prev.slice(-11), line]);
    };

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
      log(
        `↓ start (${Math.round(t.clientX)},${Math.round(t.clientY)}) → ${describe(el)}`,
      );
    };

    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (!t) return;
      const el = document.elementFromPoint(t.clientX, t.clientY);
      const vv = window.visualViewport;
      log(
        `↑ end (${Math.round(t.clientX)},${Math.round(t.clientY)}) → ${describe(el)}`,
      );
      log(
        `  innerH=${window.innerHeight} vvH=${vv ? Math.round(vv.height) : "n/a"} scrollY=${Math.round(window.scrollY)} bodyTop=${document.body.style.top || "auto"} bodyPos=${document.body.style.position || "static"}`,
      );
    };

    const vv = window.visualViewport;
    const onVVResize = () => {
      log(
        `⇕ vv resize: vvH=${vv ? Math.round(vv.height) : "n/a"} innerH=${window.innerHeight} scrollY=${Math.round(window.scrollY)} offsetTop=${vv ? Math.round(vv.offsetTop) : "n/a"}`,
      );
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
    return () => {
      document.removeEventListener("touchstart", onTouchStart, {
        capture: true,
      });
      document.removeEventListener("touchend", onTouchEnd, { capture: true });
      vv?.removeEventListener("resize", onVVResize);
    };
  }, [enabled]);

  if (!enabled) return null;

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
        maxHeight: "40vh",
        overflowY: "auto",
        pointerEvents: "none",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
      }}
    >
      {lines.length === 0 ? "waiting for touches…" : lines.join("\n")}
    </div>
  );
}
