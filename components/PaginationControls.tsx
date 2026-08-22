import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { Input } from "./ui/input";

export const PaginationControls = ({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const [jumpValue, setJumpValue] = useState(String(page));
  const [syncedPage, setSyncedPage] = useState(page);

  // Adjust local state during render when `page` changes externally
  // (prev/next, another tab's page change), instead of an effect.
  if (page !== syncedPage) {
    setSyncedPage(page);
    setJumpValue(String(page));
  }

  if (totalPages <= 1) return null;

  const commitJump = () => {
    const parsed = Number(jumpValue);
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= totalPages) {
      onPageChange(parsed);
    } else {
      setJumpValue(String(page));
    }
  };

  return (
    <Pagination className="mt-4">
      <PaginationContent className="gap-1">
        <PaginationItem>
          <button
            onClick={() => onPageChange(1)}
            aria-label="First page"
            disabled={page === 1}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronsLeft className="size-4" />
          </button>
        </PaginationItem>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, page - 1))}
            aria-disabled={page === 1}
            className={
              page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
            }
          />
        </PaginationItem>
        <PaginationItem className="flex items-center gap-1.5 px-1">
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onBlur={commitJump}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitJump();
              }
            }}
            aria-label="Go to page"
            className="w-14 h-8 text-center tabular"
          />
          <span className="text-sm text-muted-foreground">/ {totalPages}</span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            aria-disabled={page === totalPages}
            className={
              page === totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
        <PaginationItem>
          <button
            onClick={() => onPageChange(totalPages)}
            aria-label="Last page"
            disabled={page === totalPages}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronsRight className="size-4" />
          </button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
