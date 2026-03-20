"use client";

import { useTheme } from "next-themes";
import { motion } from "motion/react";
import { MoonIcon, SunIcon } from "./Icons";

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative"
    >
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
    </button>
  );
}
