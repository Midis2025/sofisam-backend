'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseAutoPollOptions {
  interval?: number; // milliseconds (default 30000 = 30s)
  enabled?: boolean;
}

export function useAutoPoll(callback: () => void | Promise<void>, options: UseAutoPollOptions = {}) {
  const { interval = 30000, enabled = true } = options;
  const savedCallback = useRef(callback);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const trigger = useCallback(async () => {
    if (isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      await savedCallback.current();
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let timer: NodeJS.Timeout | null = null;

    const startTimer = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        if (typeof document !== 'undefined' && !document.hidden) {
          trigger();
        }
      }, interval);
    };

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        // Tab became visible again: refresh immediately
        trigger();
        startTimer();
      } else if (timer) {
        clearInterval(timer);
      }
    };

    startTimer();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [interval, enabled, trigger]);

  return { trigger };
}
