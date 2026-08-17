"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, ChevronRight, ArrowLeft } from "lucide-react";
import { PRIVACY_CONTENT, TNC_CONTENT } from "@/constants/legal";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

// ─── Step Dots ────────────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i + 1 === current ? 24 : 6,
            backgroundColor:
              i + 1 < current
                ? "#10b981"
                : i + 1 === current
                  ? "#000"
                  : "#d1d5db",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="h-[6px] rounded-full"
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
        <p className="text-xs font-semibold tracking-widest uppercase text-emerald-500 mb-1">
          Dokumen
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Gulir hingga bawah untuk melanjutkan
        </p>
      </div>

      {/* Scroll progress bar */}
      <div className="h-[2px] w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500 rounded-full origin-left"
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
          className="h-full overflow-y-auto rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-line"
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
              className="absolute bottom-0 left-0 right-0 h-20 rounded-b-2xl pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, rgba(249,250,251,1) 0%, transparent 100%)",
              }}
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
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
              : "border-gray-200 dark:border-gray-700 hover:border-emerald-300"
            : "border-gray-100 dark:border-gray-800 opacity-40 cursor-not-allowed",
        )}
      >
        <motion.div
          animate={{
            scale: checked ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          {checked ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300 shrink-0" />
          )}
        </motion.div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
        <p className="text-xs font-semibold tracking-widest uppercase text-emerald-500 mb-1">
          Langkah terakhir
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Tanggal reset bulanan
        </h1>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">
          Pilih tanggal gajian atau awal siklus budgeting kamu setiap bulan.
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
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700",
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
            className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-500"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Reset setiap tanggal{" "}
              <span className="font-bold">{selectedDay}</span> setiap bulan
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
    <div className="fixed inset-0 flex flex-col bg-white dark:bg-gray-950 overflow-hidden">
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
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
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
                title="Syarat & Ketentuan"
                content={TNC_CONTENT}
                checked={tncChecked}
                onCheck={setTncChecked}
                checkLabel="Saya setuju dengan Syarat & Ketentuan Clarus"
              />
            )}
            {step === 2 && (
              <LegalStep
                title="Kebijakan Privasi"
                content={PRIVACY_CONTENT}
                checked={privacyChecked}
                onCheck={setPrivacyChecked}
                checkLabel="Saya setuju dengan Kebijakan Privasi Clarus"
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
      <div className="shrink-0 px-6 pb-10 pt-4 border-t border-gray-100 dark:border-gray-800/60">
        <motion.div whileTap={canProceed ? { scale: 0.98 } : {}}>
          <button
            onClick={goNext}
            disabled={!canProceed || loading}
            className={cn(
              "w-full h-14 rounded-2xl text-base font-semibold flex items-center justify-center gap-2 transition-all duration-300",
              canProceed && !loading
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg shadow-gray-900/20"
                : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed",
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
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full block"
                  />
                  Menyimpan...
                </motion.span>
              ) : step === 3 ? (
                <motion.span
                  key="start"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                >
                  Mulai Sekarang ✦
                </motion.span>
              ) : (
                <motion.span
                  key="next"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-1"
                >
                  Lanjut <ChevronRight className="w-4 h-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.div>

        <p className="text-center text-xs text-gray-300 dark:text-gray-600 mt-3">
          Clarus · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
