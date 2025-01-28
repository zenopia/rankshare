"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

interface UseInfiniteScrollProps<T> {
  initialData: T[];
  fetchData: (page: number) => Promise<T[]>;
  pageSize?: number;
}

export function useInfiniteScroll<T>({
  initialData,
  fetchData,
  pageSize = 6,
}: UseInfiniteScrollProps<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const currentPage = useRef(1);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMore();
    }
  }, [inView, hasMore, isLoading]);

  const loadMore = async () => {
    try {
      setIsLoading(true);
      const nextPage = currentPage.current + 1;
      const newData = await fetchData(nextPage);

      if (newData.length < pageSize) {
        setHasMore(false);
      }

      if (newData.length > 0) {
        setData((prev) => [...prev, ...newData]);
        currentPage.current = nextPage;
      }
    } catch (error) {
      console.error("[INFINITE_SCROLL]", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setData(initialData);
    setHasMore(true);
    currentPage.current = 1;
  };

  return {
    data,
    isLoading,
    hasMore,
    loadMoreRef: ref,
    reset,
  };
} 