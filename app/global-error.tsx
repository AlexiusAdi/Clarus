"use client";

import { useEffect } from "react";

/**
 * The last resort: this replaces the root layout entirely, so it runs when the
 * layout itself failed and must ship its own <html> and <body>.
 *
 * That also means none of the app's fonts, theme provider or Tailwind base
 * layer are guaranteed to be present, so the styling here is inline and the
 * colours are literal rather than tokens.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          padding: "1.5rem",
          textAlign: "center",
          background: "#faf8f2",
          color: "#1f1e1a",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div style={{ maxWidth: "24rem" }}>
          <h1 style={{ fontSize: "1.5rem", margin: 0, fontWeight: 600 }}>
            Certus could not start
          </h1>
          <p
            style={{
              marginTop: "0.5rem",
              fontSize: "0.875rem",
              color: "#6b675c",
            }}
          >
            Reload the page to try again. Your data is safe — nothing you saved
            has been lost.
          </p>
          {error.digest && (
            <p
              style={{
                marginTop: "1rem",
                fontSize: "0.75rem",
                color: "#6b675c",
              }}
            >
              Reference {error.digest}
            </p>
          )}
        </div>

        <button
          onClick={reset}
          style={{
            border: "none",
            borderRadius: "0.625rem",
            background: "#1f1e1a",
            color: "#faf8f2",
            padding: "0.625rem 1.25rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
