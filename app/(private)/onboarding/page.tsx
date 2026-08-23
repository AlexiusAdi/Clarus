"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, ChevronRight, ArrowLeft } from "lucide-react";
import { PRIVACY_CONTENT, TNC_CONTENT } from "@/constants/legal";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

// ─── Step Dots ────────────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ width: i + 1 === current ? 24 : 6 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={cn(
            "h-[6px] rounded-full transition-colors",
            i + 1 < current
              ? "bg-sage"
              : i + 1 === current
                ? "bg-foreground"
                : "bg-surface-2",
          )}
        />
      ))}
    </div>
  );
}

// ─── Legal Step ───────────────────────────────────────────────────────────────

function LegalStep({
  title,
  content,
  checked,
  onCheck,
  checkLabel,
}: {
  title: string;
  content: string;
  checked: boolean;
  onCheck: (v: boolean) => void;
  checkLabel: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    setScrolledToBottom(false);
    setScrollProgress(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [content]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const progress = el.scrollTop / (el.scrollHeight - el.clientHeight);
    setScrollProgress(Math.min(progress, 1));
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 40) {
      setScrolledToBottom(true);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full flex-1 min-h-0">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-amber mb-1">
          Document
        </p>
        <h1 className="headline text-3xl text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Scroll to the bottom to continue
        </p>
      </div>

      {/* Scroll progress bar */}
      <div className="h-[2px] w-full bg-surface-2 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-sage rounded-full origin-left"
          animate={{ scaleX: scrollProgress }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ transformOrigin: "left" }}
        />
      </div>

      {/* Scrollable content */}
      <div className="relative flex-1 min-h-0">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto rounded-2xl border border-border bg-surface-2 p-5 text-sm text-muted-foreground leading-relaxed whitespace-pre-line"
          style={{ scrollbarWidth: "none" }}
        >
          {content.trim()}
          <div className="h-6" />
        </div>

        {/* Bottom fade overlay when not scrolled to bottom */}
        <AnimatePresence>
          {!scrolledToBottom && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 h-20 rounded-b-2xl pointer-events-none bg-gradient-to-t from-background to-transparent"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Checkbox */}
      <motion.button
        disabled={!scrolledToBottom}
        onClick={() => onCheck(!checked)}
        whileTap={scrolledToBottom ? { scale: 0.98 } : {}}
        className={cn(
          "flex items-center gap-3 p-4 rounded-2xl border-2 transition-colors text-left",
          scrolledToBottom
            ? checked
              ? "border-sage bg-sage-soft"
              : "border-border hover:border-sage/50"
            : "border-border opacity-40 cursor-not-allowed",
        )}
      >
        <motion.div
          animate={{
            scale: checked ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          {checked ? (
            <CheckCircle2 className="w-5 h-5 text-sage shrink-0" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
          )}
        </motion.div>
        <span className="text-sm font-medium text-foreground">
          {checkLabel}
        </span>
      </motion.button>
    </div>
  );
}

// ─── Reset Day Step ───────────────────────────────────────────────────────────

function ResetDayStep({
  selectedDay,
  onSelect,
}: {
  selectedDay: number | null;
  onSelect: (day: number) => void;
}) {
  return (
    <div className="flex flex-col gap-6 w-full flex-1 min-h-0">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-amber mb-1">
          Last step
        </p>
        <h1 className="headline text-3xl text-foreground">
          Monthly reset date
        </h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Pick your payday or the start of your monthly budgeting cycle.
        </p>
      </div>

      <div className="grid grid-cols-7 gap-2 w-full">
        {Array.from({ length: 28 }, (_, i) => i + 1).map((day, idx) => (
          <motion.button
            key={day}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: idx * 0.015,
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
            onClick={() => onSelect(day)}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "aspect-square rounded-xl flex items-center justify-center text-sm font-semibold transition-colors",
              selectedDay === day
                ? "bg-foreground text-background"
                : "bg-surface-2 text-muted-foreground hover:bg-accent",
            )}
          >
            {day}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-sage-soft border-2 border-sage"
          >
            <CheckCircle2 className="w-5 h-5 text-sage shrink-0" />
            <p className="text-sm font-medium text-sage">
              Resets on day <span className="font-bold">{selectedDay}</span>{" "}
              of every month
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page Transition Variants ─────────────────────────────────────────────────

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-30%",
    opacity: direction > 0 ? 0 : 0.3,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-30%" : "100%",
    opacity: direction > 0 ? 0.3 : 0,
  }),
};

const pageTransition = {
  type: "spring" as const,
  stiffness: 350,
  damping: 35,
  mass: 0.8,
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);
  const [tncChecked, setTncChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const canProceed =
    (step === 1 && tncChecked) ||
    (step === 2 && privacyChecked) ||
    (step === 3 && selectedDay !== null);

  const goNext = async () => {
    if (step < 3) {
      setDirection(1);
      setStep((s) => (s + 1) as Step);
      return;
    }
    if (!selectedDay) return;
    setLoading(true);
    await fetch("/api/user/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resetDay: selectedDay,
        agreedToTnc: true,
        agreedToPrivacy: true,
      }),
    });
    router.push("/home");
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => (s - 1) as Step);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-14 pb-4 shrink-0">
        <AnimatePresence mode="wait">
          {step > 1 ? (
            <motion.button
              key="back"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={goBack}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-2 text-ink-soft"
            >
              <ArrowLeft className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.div key="spacer" className="w-9 h-9" />
          )}
        </AnimatePresence>

        <StepDots current={step} total={3} />

        <div className="w-9 h-9" />
      </div>

      {/* Content area — animated */}
      <div className="flex-1 min-h-0 relative overflow-hidden px-6 pb-2">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="absolute inset-0 px-6 flex flex-col"
            style={{ paddingBottom: "8px" }}
          >
            {step === 1 && (
              <LegalStep
                title="Terms & Conditions"
                content={TNC_CONTENT}
                checked={tncChecked}
                onCheck={setTncChecked}
                checkLabel="I agree to Clarus's Terms & Conditions"
              />
            )}
            {step === 2 && (
              <LegalStep
                title="Privacy Policy"
                content={PRIVACY_CONTENT}
                checked={privacyChecked}
                onCheck={setPrivacyChecked}
                checkLabel="I agree to Clarus's Privacy Policy"
              />
            )}
            {step === 3 && (
              <ResetDayStep
                selectedDay={selectedDay}
                onSelect={setSelectedDay}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom CTA — always pinned */}
      <div className="shrink-0 px-6 pb-10 pt-4 border-t border-border">
        <motion.div whileTap={canProceed ? { scale: 0.98 } : {}}>
          <button
            onClick={goNext}
            disabled={!canProceed || loading}
            className={cn(
              "w-full h-14 rounded-2xl text-base font-semibold flex items-center justify-center gap-2 transition-all duration-300",
              canProceed && !loading
                ? "bg-foreground text-background shadow-lg shadow-ink/20"
                : "bg-surface-2 text-muted-foreground cursor-not-allowed",
            )}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full block"
                  />
                  Saving...
                </motion.span>
              ) : step === 3 ? (
                <motion.span
                  key="start"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                >
                  Get started ✦
                </motion.span>
              ) : (
                <motion.span
                  key="next"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-1"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-3">
          Clarus · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
