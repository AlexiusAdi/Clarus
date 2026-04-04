"use client";

import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AI_FEEDBACKS = [
  `You're doing well on your <strong>Emergency Fund</strong> — 80% there with 2 months to go. However, your <strong>Bali Trip</strong> is falling behind. Try cutting <strong>Entertainment</strong> by 30% next month. 💡`,
  `Focus on your <strong>Bali Trip</strong> — it's your most urgent goal. Consider an automatic transfer of <strong>Rp 1.4M</strong> on payday. 🎉`,
  `Priority: <strong>Emergency Fund</strong> first, then redirect to <strong>Bali Trip</strong> after May. New Laptop is healthy. 🧠`,
];

export default function GoalsAIFeedback() {
  const [index, setIndex] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [html, setHtml] = useState(AI_FEEDBACKS[0]);

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setHtml("");
    setTimeout(() => {
      const next = (index + 1) % AI_FEEDBACKS.length;
      setIndex(next);
      setHtml(AI_FEEDBACKS[next]);
      setIsRegenerating(false);
    }, 1200);
  };

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
              Clarus AI · April 2026
            </span>
            <span className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>

          {isRegenerating ? (
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
            <p
              className="text-sm text-muted-foreground leading-relaxed [&_strong]:text-background"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-background transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Regenerate feedback
          </button>
        </CardContent>
      </Card>
    </>
  );
}
