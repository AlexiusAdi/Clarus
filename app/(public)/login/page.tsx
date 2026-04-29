"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  useGSAP(() => {
    gsap.from("#title", {
      opacity: 1,
      x: 400,
      duration: 1,
      stagger: 0.3,
      ease: "power1.out",
    });

    gsap.from("#login-card", {
      opacity: 0,
      delay: 1,
      duration: 1,
      stagger: 0.3,
      ease: "power1.out",
    });
  }, []);

  return (
    <div className="hero-container flex flex-col gap-8 items-center justify-center h-screen p-4">
      <div id="title" className="flex flex-col items-center gap-1">
        <a
          className="text-6xl text-obsidian"
          onClick={() => redirect("/login")}
        >
          Clarus
        </a>
        <span className="text-sm text-muted-foreground tracking-wide">
          Your finances, made clear.
        </span>
      </div>
      <div id="login-card" className="w-full flex items-center justify-center">
        <Button
          className="active:scale-105 bg-obsidian hover:bg-obsidian/80 text-porcelinwhite gap-2.5"
          onClick={() => signIn("google", { callbackUrl: "/home" })}
        >
          <FcGoogle size={16} />
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
