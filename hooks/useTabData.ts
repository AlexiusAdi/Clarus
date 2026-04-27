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
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [visible, setVisible] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const refetch = () => setRefreshKey((k) => k + 1);

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
        console.log(
          tab,
          json.total,
          json.pageSize,
          Math.ceil(json.total / json.pageSize),
        );
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
  };
}
