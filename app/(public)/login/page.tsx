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
      <div id="title">
        <a className="text-6xl" onClick={() => redirect("/login")}>
          Clarus
        </a>
      </div>
      <div id="login-card" className="w-full flex items-center justify-center">
        <Card className=" w-full max-w-sm bg-porcelinwhite border-2 ">
          <CardHeader>
            <CardTitle className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-2 items-center dark:text-black">
                <p>Please sign in to continue</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-col gap-2 dark:text-black dark:border-gray-gray-300">
            <Button
              variant="outline"
              className="w-full bg-porcelinwhite border-2 border-gray-300 hover:bg-gray-100"
              onClick={() => signIn("google", { callbackUrl: "/home" })}
            >
              <FcGoogle width={5} height={5} />
              Login with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
