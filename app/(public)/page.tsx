"use client";

import TransitionEffect from "@/components/TransitionEffect";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useGSAP(() => {
    const timeline = gsap.timeline();

    timeline
      .from("#welcome", {
        opacity: 0,
        y: -40,
        duration: 1.2,
        delay: 2,
        ease: "power1.out",
      })
      .from("#tagline", {
        opacity: 0,
        y: 10,
        duration: 0.6,
        ease: "power1.out",
      })
      .from("#startButton", {
        opacity: 0,
        y: 10,
        duration: 0.6,
        ease: "power1.inOut",
      });
  });

  return (
    <div>
      <TransitionEffect />
      <div className="flex flex-col w-full items-center justify-center h-screen gap-10 p-4">
        <div className="flex flex-col items-center gap-2">
          <div id="welcome">
            <h1 className="text-6xl text-obsidian">Clarus</h1>
          </div>
          <div id="tagline">
            <span className="text-sm text-muted-foreground tracking-wide">
              Personal Finance
            </span>
          </div>
        </div>

        <div id="startButton" className="w-full flex justify-center">
          <button
            onClick={() => router.push("/login")}
            className="w-3/4 h-11 bg-obsidian hover:bg-obsidian/80 text-porcelinwhite rounded-[10px] text-sm font-medium transition-colors cursor-pointer"
          >
            Get started
          </button>
        </div>
      </div>
    </div>
  );
}
