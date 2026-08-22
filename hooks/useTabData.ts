import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

type DateRangeParam = { from?: string; to?: string };

export function useTabData<T>(
  tab: string,
  activeTab: string,
  apiPath: string,
  settingsVersion: number,
  dateRange?: DateRangeParam,
) {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10); // default until API responds
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [visible, setVisible] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const refetch = () => setRefreshKey((k) => k + 1);

  const from = dateRange?.from;
  const to = dateRange?.to;
  const prevRangeRef = useRef<DateRangeParam>({});

  useEffect(() => {
    if (activeTab !== tab) return;

    // Reset to page 1 when settings change
    if (settingsVersion > 0) {
      setPage(1);
    }

    // Reset to page 1 when the date filter changes, without fetching the
    // stale page under the new range first.
    if (prevRangeRef.current.from !== from || prevRangeRef.current.to !== to) {
      prevRangeRef.current = { from, to };
      if (page !== 1) {
        setPage(1);
        return;
      }
    }

    const fetch_ = async () => {
      try {
        const params = new URLSearchParams({ page: String(page) });
        if (from) params.set("from", from);
        if (to) params.set("to", to);

        const res = await fetch(`${apiPath}?${params.toString()}`);
        const json: PaginatedResult<T> = await res.json();
        setData(json.data);
        setTotal(json.total);
        setPageSize(json.pageSize);
        setTotalPages(Math.ceil(json.total / json.pageSize));
      } catch {
        toast.error(`Failed to load ${tab.toLowerCase()}`);
      } finally {
        setInitialLoading(false);
      }
    };

    fetch_();
  }, [activeTab, page, settingsVersion, refreshKey, from, to]);

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
  };
}
