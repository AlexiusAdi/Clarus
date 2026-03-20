"use client";

import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import TransitionEffect from "@/components/TransitionEffect";

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 p-4">
      <TransitionEffect />
      <div
        id="welcome"
        className="flex flex-col gap-2 items-center justify-center text-center"
      >
        <h1 className="text-3xl text-semibold text-shadow-2xs">Your goals?</h1>
        <span>This will help us tailor the experience to your needs.</span>
      </div>
      <Textarea className="shadow-md h-25" />
      <div id="continueButton">
        <Button size="lg" onClick={() => redirect("/home")}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default page;
