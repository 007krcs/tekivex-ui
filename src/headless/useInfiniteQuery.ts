'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface InfiniteQueryOptions<T, C = unknown> {
  queryFn: (cursor: C | null, pageIndex: number) => Promise<{ data: T[]; nextCursor: C | null; hasMore: boolean }>;
  initialCursor?: C | null;
  pageSize?: number;
  enabled?: boolean;
  dedupKey?: string;
}

export interface InfiniteQueryState<T, C = unknown> {
  data: T[];
  pages: T[][];
  status: 'idle' | 'loading' | 'success' | 'error' | 'fetching-more';
  error: Error | null;
  hasMore: boolean;
  isFetchingMore: boolean;
  fetchMore: () => void;
  reset: () => void;
  pageIndex: number;
  totalLoaded: number;
}

/**
 * Headless infinite-scroll / pagination hook with cursor-based querying,
 * dedup protection, and safe unmount cleanup.
 *
 * @example
 * const query = useInfiniteQuery({
 *   queryFn: async (cursor) => fetchPosts({ cursor }),
 * });
 * // In your component: query.data, query.fetchMore(), query.hasMore
 */
export function useInfiniteQuery<T, C = unknown>(
  options: InfiniteQueryOptions<T, C>,
): InfiniteQueryState<T, C> {
  const {
    queryFn,
    initialCursor = null,
    enabled = true,
    dedupKey,
  } = options;

  const [pages, setPages] = useState<T[][]>([]);
  const [status, setStatus] = useState<InfiniteQueryState<T, C>['status']>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  const cursorRef = useRef<C | null>(initialCursor ?? null);
  const isFetchingRef = useRef(false);
  const mountedRef = useRef(true);
  const lastDedupKeyRef = useRef<string | undefined>(undefined);

  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const loadPage = useCallback(
    async (cursor: C | null, index: number, isFirstPage: boolean) => {
      if (isFetchingRef.current) return;

      // Dedup: skip if same key as last completed fetch
      if (dedupKey !== undefined && dedupKey === lastDedupKeyRef.current) return;

      isFetchingRef.current = true;
      let aborted = false;

      if (mountedRef.current) {
        setStatus(isFirstPage ? 'loading' : 'fetching-more');
        setError(null);
      }

      try {
        const result = await queryFnRef.current(cursor, index);

        if (aborted || !mountedRef.current) return;

        if (dedupKey !== undefined) {
          lastDedupKeyRef.current = dedupKey;
        }

        cursorRef.current = result.nextCursor;

        setPages(prev => {
          if (isFirstPage) return [result.data];
          return [...prev, result.data];
        });
        setHasMore(result.hasMore);
        setPageIndex(index);
        setStatus('success');
      } catch (err) {
        if (aborted || !mountedRef.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setStatus('error');
      } finally {
        if (!aborted) isFetchingRef.current = false;
      }

      // Return cleanup so callers can signal abort
      return () => { aborted = true; };
    },
    // dedupKey intentionally included to allow re-checking on each call
    [dedupKey],
  );

  const fetchMore = useCallback(() => {
    if (!hasMore || isFetchingRef.current) return;
    void loadPage(cursorRef.current, pageIndex + 1, false);
  }, [hasMore, pageIndex, loadPage]);

  const reset = useCallback(() => {
    isFetchingRef.current = false;
    lastDedupKeyRef.current = undefined;
    cursorRef.current = initialCursor ?? null;
    setPages([]);
    setStatus('idle');
    setError(null);
    setHasMore(false);
    setPageIndex(0);
  }, [initialCursor]);

  // Initial load
  useEffect(() => {
    mountedRef.current = true;

    if (enabled) {
      void loadPage(initialCursor ?? null, 0, true);
    }

    return () => {
      mountedRef.current = false;
    };
  // Only run on mount / when enabled changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const data = pages.flat();
  const isFetchingMore = status === 'fetching-more';
  const totalLoaded = data.length;

  return {
    data,
    pages,
    status,
    error,
    hasMore,
    isFetchingMore,
    fetchMore,
    reset,
    pageIndex,
    totalLoaded,
  };
}