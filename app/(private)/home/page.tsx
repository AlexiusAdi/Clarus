"use client";

import NetWorthCard from "@/components/NetWorthCard";
import ThemeToggle from "@/components/ThemeToggle";
import { ArrowRight } from "lucide-react";
import FloatingMenu from "@/components/FloatingMenu";
import HomeTabs from "@/components/HomeTabs";
import { SmallCard } from "@/components/SmallCard";
import { useEffect, useState } from "react";

const Page = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("visible");
    if (stored !== null) {
      setIsVisible(stored === "true");
    }
    setMounted(true);
  }, []);

  const toggleVisibility = () => {
    setIsVisible((prev) => {
      const newValue = !prev;
      localStorage.setItem("visible", String(newValue));
      return newValue;
    });
  };

  return (
    <div className="@container/main w-screen mb-20 p-4">
      <FloatingMenu />
      <div className="w-full flex flex-col text-right pb-4">
        <ThemeToggle />
        <span>Hello, Adi</span>
      </div>
      <NetWorthCard isVisible={isVisible} toggleVisibility={toggleVisibility} />
      <div className="flex gap-2 pb-3">
        <SmallCard
          header="Income"
          amount={12000000}
          icon={
            <ArrowRight className="inline-block mr-2 text-green-500 rotate-320" />
          }
          isVisible={isVisible}
        />
        <SmallCard
          header="Expenses"
          amount={2000000}
          icon={
            <ArrowRight className="inline-block mr-2 text-red-500 rotate-30" />
          }
          isVisible={isVisible}
        />
      </div>
      <div className="flex w-full">
        <HomeTabs />
      </div>
    </div>
  );
};

export default Page;
