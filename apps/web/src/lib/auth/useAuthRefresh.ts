'use client';

import { useEffect, useRef } from 'react';

type RefreshOptions = {
  refreshPath?: string;
  logoutPath?: string;
  skewMs?: number;
};

function readCookie(name: string) {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
}

function readCookieNumber(name: string) {
  const raw = readCookie(name);
  if (!raw) return undefined;
  const num = Number(decodeURIComponent(raw));
  return Number.isFinite(num) ? num : undefined;
}

export function useAuthRefresh(options: RefreshOptions = {}) {
  const {
    refreshPath = '/auth/refresh',
    logoutPath = '/auth/logout',
    skewMs = 60_000,
  } = options;
  const timeoutRef = useRef<number>();

  useEffect(() => {
    let cancelled = false;

    const clear = () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    };

    const scheduleNext = () => {
      const refreshExp = readCookieNumber('refresh_exp');
      const accessExp = readCookieNumber('access_exp');

      if (!refreshExp || refreshExp <= Date.now() || !accessExp) {
        void callLogout();
        return;
      }

      const delay = Math.max(accessExp - Date.now() - skewMs, 5_000);
      timeoutRef.current = window.setTimeout(runRefresh, delay);
    };

    const callLogout = async () => {
      clear();
      await fetch(logoutPath, {
        method: 'POST',
        credentials: 'include',
      }).catch(() => undefined);
    };

    const runRefresh = async () => {
      if (cancelled) return;

      const refreshExp = readCookieNumber('refresh_exp');
      if (!refreshExp || refreshExp <= Date.now()) {
        await callLogout();
        return;
      }

      await fetch(refreshPath, {
        method: 'POST',
        credentials: 'include',
      }).catch(() => undefined);

      if (!cancelled) scheduleNext();
    };

    const init = () => {
      const refreshExp = readCookieNumber('refresh_exp');
      const accessExp = readCookieNumber('access_exp');
      if (!refreshExp || refreshExp <= Date.now() || !accessExp) {
        void callLogout();
        return;
      }

      runRefresh();
    };

    init();

    return () => {
      cancelled = true;
      clear();
    };
  }, [refreshPath, logoutPath, skewMs]);
}
