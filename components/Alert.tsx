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
  /** Fired the instant delete is confirmed, and again once the request
   *  settles, so the triggering card can disable its own icons without the
   *  dialog having to stay open for the round trip. */
  onPendingChange?: (pending: boolean) => void;
}

const Alert = ({
  open,
  onOpenChange,
  apiUrl,
  successMessage = "Deleted successfully",
  description = "This action cannot be undone. This will permanently delete this item.",
  onPendingChange,
}: AlertProps) => {
  const router = useRouter();
  const { refetchActive } = useTabsContext();

  // Close the dialog immediately instead of holding it open with a spinner
  // for the whole request — the card shows its own pending state instead.
  const handleDelete = async () => {
    onOpenChange(false);
    onPendingChange?.(true);

    try {
      const res = await fetch(apiUrl, { method: "DELETE" });
      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      toast.success(successMessage, { position: "top-center" });
      refetchActive();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      onPendingChange?.(false);
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
