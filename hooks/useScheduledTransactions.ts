import { useState } from "react";
import { toast } from "sonner";
import { ScheduledTransactionDTO } from "@/lib/helper/getScheduledTransactions";

export const useScheduledTransactions = (
  initial: ScheduledTransactionDTO[] = [],
  onListChange?: (items: ScheduledTransactionDTO[]) => void,
) => {
  const [items, setItems] = useState<ScheduledTransactionDTO[]>(initial);
  const [loading, setLoading] = useState(false);

  const fetchScheduled = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/scheduled-transaction");
      const data = await res.json();
      setItems(data);
      onListChange?.(data);
    } catch {
      toast.error("Failed to load scheduled transactions", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return { items, setItems, loading, fetchScheduled };
};
