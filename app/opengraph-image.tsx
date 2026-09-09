import { ImageResponse } from "next/og";

/**
 * The card shown when a Certus link is pasted into WhatsApp, Slack or X.
 *
 * Generated rather than shipped as a file so it follows the palette instead of
 * going stale, and so there is no binary to re-export when the wording changes.
 * No custom font is loaded: fetching one at render time is a failure mode for a
 * preview image, and the app's own `headline` utility is a sans face anyway.
 */
export const alt = "Certus — your finances, made clear";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#1f1d19";
const CREAM = "#faf8f2";
const AMBER = "#e08a4c";
const MUTED = "#6b675c";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: CREAM,
          padding: 80,
        }}
      >
        {/* The icon's mark, redrawn at card scale: open ring, amber dot. */}
        <div style={{ display: "flex" }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: INK,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                border: `9px solid ${CREAM}`,
                borderRightColor: "transparent",
                display: "flex",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              fontSize: 104,
              fontWeight: 600,
              letterSpacing: -3,
              color: INK,
            }}
          >
            Certus
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                background: AMBER,
                display: "flex",
              }}
            />
          </div>
          <div style={{ display: "flex", fontSize: 40, color: MUTED }}>
            Your finances, made clear.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: MUTED,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Income · Expenses · Assets · Investments · Goals
        </div>
      </div>
    ),
    size,
  );
}
