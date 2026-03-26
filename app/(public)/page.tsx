"use client";

import TransitionEffect from "@/components/TransitionEffect";
import { Button } from "@/components/ui/button";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { redirect } from "next/navigation";

export default function Home() {
  useGSAP(() => {
    const timeline = gsap.timeline();

    timeline
      .from("#welcome", {
        opacity: 0,
        y: -240,
        duration: 1.2,
        delay: 2,
        ease: "power1.out",
      })
      .from("#startButton", {
        opacity: 0,
        ease: "power1.inOut",
      });
  });

  return (
    <div>
      <TransitionEffect />
      <div className="flex flex-col w-full items-center justify-center h-screen gap-4">
        <div id="welcome">
          <h1 className="text-5xl text-shadow-2xs">Welcome</h1>
        </div>
        <div id="startButton">
          <Button
            variant="outline"
            size="lg"
            className="shadow-md"
            onClick={() => redirect("/login")}
          >
            Start
          </Button>
        </div>
      </div>
    </div>
  );
}
