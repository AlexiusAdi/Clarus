"use client";

import { createContext, useContext } from "react";
import { useScheduledTransactions } from "@/hooks/useScheduledTransactions";
import { ScheduledTransactionDTO } from "@/lib/helper/getScheduledTransactions";

type ContextType = ReturnType<typeof useScheduledTransactions>;

const ScheduledTransactionsContext = createContext<ContextType | null>(null);

export const ScheduledTransactionsProvider = ({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial: ScheduledTransactionDTO[];
}) => {
  const value = useScheduledTransactions(initial);
  return (
    <ScheduledTransactionsContext.Provider value={value}>
      {children}
    </ScheduledTransactionsContext.Provider>
  );
};

export const useScheduledTransactionsContext = () => {
  const ctx = useContext(ScheduledTransactionsContext);
  if (!ctx)
    throw new Error("Must be used within ScheduledTransactionsProvider");
  return ctx;
};
