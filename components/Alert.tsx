"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogAction,
} from "./ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTabsContext } from "./TabsProvider";

interface AlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiUrl: string;
  successMessage?: string;
  description?: string;
  /** Row id, so the card can disappear before the request finishes. */
  itemId?: string;
  /** Overrides the tab-context removal for lists that hold their own state. */
  onOptimisticRemove?: () => void;
  /** Undoes onOptimisticRemove and re-enables the card when the delete fails. */
  onRemoveFailed?: () => void;
  /** Fired the instant delete is confirmed, so the card can disable its actions. */
  onDeleteStart?: () => void;
}

const Alert = ({
  open,
  onOpenChange,
  apiUrl,
  successMessage = "Deleted successfully",
  description = "This action cannot be undone. This will permanently delete this item.",
  itemId,
  onOptimisticRemove,
  onRemoveFailed,
  onDeleteStart,
}: AlertProps) => {
  const router = useRouter();
  const { refetchActive, removeActiveItem } = useTabsContext();

  /**
   * Optimistic: close the dialog and drop the card first, then talk to the
   * server. Waiting for the DELETE, a refetch, and a full router.refresh()
   * before anything moved on screen was the whole reason deleting felt slow.
   */
  const handleDelete = async () => {
    onOpenChange(false);
    onDeleteStart?.();

    if (onOptimisticRemove) onOptimisticRemove();
    else if (itemId) removeActiveItem(itemId);

    try {
      const res = await fetch(apiUrl, { method: "DELETE" });
      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      toast.success(successMessage, { position: "top-center" });
      // Both still run, but nothing on screen is waiting for them: refetch
      // pulls up the row that shifted in from the next page, and refresh
      // updates the server-rendered header totals.
      refetchActive();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
      // Put the row back by re-reading the server rather than guessing.
      onRemoveFailed?.();
      refetchActive();
      router.refresh();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="active:scale-95 transition-transform">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="active:scale-95 transition-transform"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Alert;
