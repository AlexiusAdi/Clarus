"use client";

import { useCallback, useEffect, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

type Insight = {
  content: string | null;
  generatedAt: string | null;
  available?: boolean;
};

/**
 * The summary is written by Claude and stored per user, so opening this page
 * costs nothing — only the refresh button spends a request, and the server
 * holds it to one an hour.
 *
 * The text is rendered as text, never as HTML. Model output is untrusted input
 * as far as the DOM is concerned.
 */
export default function GoalsAIFeedback() {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch("/api/user/ai/goals")
      .then((r) => r.json())
      .then(setInsight)
      .catch(() => setInsight({ content: null, generatedAt: null }))
      .finally(() => setLoading(false));
  }, []);

  const generate = useCallback(async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/user/ai/goals", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message ?? "Could not write your summary");
        return;
      }
      setInsight(data);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setGenerating(false);
    }
  }, []);

  if (loading) return null;
  if (insight?.available === false) return null;

  const generatedLabel = insight?.generatedAt
    ? new Date(insight.generatedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
        AI Feedback
      </p>
      <Card className="bg-foreground text-background mb-5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-muted" />
            <span className="text-xs font-bold text-muted uppercase tracking-widest">
              Certus AI{generatedLabel ? ` · ${generatedLabel}` : ""}
            </span>
          </div>

          {generating ? (
            <div className="flex gap-1 items-center py-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {insight?.content ??
                "No summary yet. Write one to see how your goals are tracking."}
            </p>
          )}

          <button
            onClick={generate}
            disabled={generating}
            className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-background transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${generating ? "animate-spin" : ""}`} />
            {insight?.content ? "Refresh summary" : "Write my summary"}
          </button>
        </CardContent>
      </Card>
    </>
  );
}
