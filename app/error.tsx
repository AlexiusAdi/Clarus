"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Catches render and data-loading errors anywhere below the root layout.
 *
 * Next only shows the real message in development; in production `error`
 * carries a digest that matches a line in the server logs, so the digest is
 * surfaced deliberately — it is the only thing a user can quote that lets you
 * find their failure.
 */
export default function Error({
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="max-w-sm">
        <h1 className="headline text-2xl">This page did not load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our side. Your data is safe — nothing you
          saved has been lost.
        </p>
        {error.digest && (
          <p className="tabular mt-4 text-xs text-muted-foreground">
            Reference {error.digest}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} className="active:scale-95 transition-transform">
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/home">Go to home</Link>
        </Button>
      </div>
    </div>
  );
}
