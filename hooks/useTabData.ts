import { useState, useEffect } from "react";
import { toast } from "sonner";

type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

export function useTabData<T>(
  tab: string,
  activeTab: string,
  apiPath: string,
  settingsVersion: number,
) {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10); // default until API responds
  const [page, setPage] = useState(1);

  // Derived, not stored: an optimistic removal changes `total`, and a separate
  // totalPages state would keep offering a page that no longer exists.
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const [initialLoading, setInitialLoading] = useState(true);
  const [visible, setVisible] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const refetch = () => setRefreshKey((k) => k + 1);

  /**
   * Drop a row locally so a delete feels instant. The server call still runs;
   * the caller refetches afterwards either way — on success to pull up the row
   * that shifted in from the next page, on failure to put this one back.
   */
  const removeItem = (id: string) => {
    const next = data.filter((item) => (item as { id?: string }).id !== id);
    setData(next);
    setTotal((t) => Math.max(0, t - 1));

    // Emptying the last page would otherwise strand the user on a blank one.
    if (next.length === 0 && page > 1) setPage((p) => p - 1);
  };

  useEffect(() => {
    if (activeTab !== tab) return;

    // Reset to page 1 when settings change
    if (settingsVersion > 0) {
      setPage(1);
    }

    const fetch_ = async () => {
      try {
        const res = await fetch(`${apiPath}?page=${page}`);
        const json: PaginatedResult<T> = await res.json();
        setData(json.data);
        setTotal(json.total);
        setPageSize(json.pageSize);
      } catch {
        toast.error(`Failed to load ${tab.toLowerCase()}`);
      } finally {
        setInitialLoading(false);
      }
    };

    fetch_();
  }, [activeTab, page, settingsVersion, refreshKey]);

  const handlePageChange = (newPage: number) => {
    setVisible(false);
    setTimeout(() => {
      setPage(newPage);
      setVisible(true);
    }, 150);
  };

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
    initialLoading,
    visible,
    handlePageChange,
    refetch,
    removeItem,
  };
}
