"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  X,
} from "lucide-react";
import { PRIVACY_CONTENT, TNC_CONTENT } from "@/constants/legal";
import { motion, AnimatePresence } from "framer-motion";
import { NumericFormat } from "react-number-format";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/helper/formatCurrency";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4;

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
          Almost there
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

// ─── Starting Balance Step ────────────────────────────────────────────────────

/**
 * A month of ordinary activity, used only by the comparison panel below. It
 * exists so the panel shows the gap *persisting* rather than looking like a
 * day-one problem that sorts itself out.
 */
const DEMO_MONTH_NET = 7_650_000;

function StartingBalanceStep({
  amount,
  onChange,
}: {
  amount: string;
  onChange: (value: string) => void;
}) {
  const [view, setView] = useState<"set" | "skip">("set");

  const base = amount === "" ? 0 : Number(amount);
  const bank = base + DEMO_MONTH_NET;
  const agrees = view === "set";
  const certus = agrees ? bank : DEMO_MONTH_NET;

  const bump = (by: number) => onChange(String(base + by));

  return (
    <div className="flex flex-col gap-5 w-full flex-1 min-h-0 overflow-y-auto">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-amber mb-1">
          Last step
        </p>
        <h1 className="headline text-3xl text-foreground">
          What do you have right now?
        </h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Everything you can spend today — bank accounts, e-wallets, cash — as
          one total. Certus does not count this as income, so it stays out of
          your charts.
        </p>
      </div>

      <div>
        <label
          htmlFor="starting-balance"
          className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
        >
          Starting balance
        </label>
        <NumericFormat
          id="starting-balance"
          customInput={Input}
          thousandSeparator="."
          decimalSeparator=","
          prefix="Rp "
          placeholder="Rp 0"
          inputMode="decimal"
          allowNegative={false}
          decimalScale={2}
          value={amount}
          onValueChange={(v) => onChange(v.value)}
          className="headline tabular mt-1 h-14 rounded-none border-0 border-b-2 border-border px-0 text-3xl shadow-none focus-visible:border-foreground focus-visible:ring-0"
        />
      </div>

      <div className="flex gap-2">
        {[1_000_000, 5_000_000, 10_000_000].map((step) => (
          <button
            key={step}
            onClick={() => bump(step)}
            className="flex-1 h-11 rounded-xl border border-border bg-card text-[13px] font-semibold active:scale-95 transition-transform"
          >
            +{step / 1_000_000} jt
          </button>
        ))}
        <button
          onClick={() => onChange("")}
          aria-label="Clear amount"
          className="w-11 h-11 shrink-0 rounded-xl border border-border bg-card text-muted-foreground flex items-center justify-center active:scale-95 transition-transform"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* The tutorial: what skipping actually costs, priced in their own number. */}
      <div className="rounded-2xl bg-surface-2 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            A month from now
          </p>
          <div className="flex gap-0.5 p-0.5 rounded-lg border border-border bg-card">
            {(["set", "skip"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "h-6 px-2.5 rounded-md text-[11px] font-semibold transition-colors",
                  view === v
                    ? "bg-foreground text-background"
                    : "text-muted-foreground",
                )}
              >
                {v === "set" ? "If you set it" : "If you skip"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[13px] text-ink-soft">Certus shows</p>
            <p
              className={cn(
                "tabular text-[15px] font-semibold",
                agrees ? "text-sage" : "text-clay",
              )}
            >
              {formatCurrency(certus)}
            </p>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[13px] text-ink-soft">Your bank shows</p>
            <p className="tabular text-[15px] font-semibold">
              {formatCurrency(bank)}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "flex items-center gap-2 rounded-xl px-3 py-2.5",
            agrees ? "bg-sage-soft text-sage" : "bg-clay-soft text-clay",
          )}
        >
          {agrees ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <p className="text-xs font-semibold leading-[17px]">
            {agrees
              ? "Certus matches your bank."
              : `Certus is short by ${formatCurrency(base)}, and stays short.`}
          </p>
        </div>
      </div>

      <div className="flex gap-2.5 items-start px-0.5">
        <ArrowDownToLine className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
        <p className="text-xs leading-[17px] text-muted-foreground">
          Have months of old transactions? Import them from Settings later, then
          check this number again.
        </p>
      </div>
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
  const [openingBalance, setOpeningBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const canProceed =
    (step === 1 && tncChecked) ||
    (step === 2 && privacyChecked) ||
    (step === 3 && selectedDay !== null) ||
    step === 4;

  // `skip` leaves the opening balance out of the request entirely, which the
  // API reads as "never answered" — different from answering zero, and what
  // keeps the prompt on the home screen alive for them.
  const finish = async (skip = false) => {
    if (!selectedDay) return;
    setLoading(true);
    await fetch("/api/user/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resetDay: selectedDay,
        agreedToTnc: true,
        agreedToPrivacy: true,
        ...(skip || openingBalance === ""
          ? {}
          : { openingBalance: Number(openingBalance) }),
      }),
    });
    router.push("/home");
  };

  const goNext = async () => {
    if (step < 4) {
      setDirection(1);
      setStep((s) => (s + 1) as Step);
      return;
    }
    await finish();
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

        <StepDots current={step} total={4} />

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
                checkLabel="I agree to Certus's Terms & Conditions"
              />
            )}
            {step === 2 && (
              <LegalStep
                title="Privacy Policy"
                content={PRIVACY_CONTENT}
                checked={privacyChecked}
                onCheck={setPrivacyChecked}
                checkLabel="I agree to Certus's Privacy Policy"
              />
            )}
            {step === 3 && (
              <ResetDayStep
                selectedDay={selectedDay}
                onSelect={setSelectedDay}
              />
            )}
            {step === 4 && (
              <StartingBalanceStep
                amount={openingBalance}
                onChange={setOpeningBalance}
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
              ) : step === 4 ? (
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

        {step === 4 ? (
          <div className="flex justify-center mt-3">
            <button
              onClick={() => finish(true)}
              disabled={loading}
              className="text-xs font-medium text-muted-foreground disabled:opacity-50"
            >
              Skip — set it later in Settings
            </button>
          </div>
        ) : (
          <p className="text-center text-xs text-muted-foreground mt-3">
            Certus · {new Date().getFullYear()}
          </p>
        )}
      </div>
    </div>
  );
}
