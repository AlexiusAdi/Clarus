"use client";

import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
import { MoonIcon, SunIcon } from "./Icons";
import { useState, useEffect } from "react";
import { Skeleton } from "./ui/skeleton";

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      {mounted ? (
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="relative"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={resolvedTheme}
              initial={{ opacity: 0, x: 40, y: -40, rotate: 20 }}
              animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
              exit={{ opacity: 0, x: -40, y: 40, rotate: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute"
            >
              {resolvedTheme === "light" ? <SunIcon /> : <MoonIcon />}
            </motion.div>
          </AnimatePresence>
        </button>
      ) : (
        <Skeleton className="absolute h-7 w-7 rounded-full" />
      )}
    </>
  );
}
