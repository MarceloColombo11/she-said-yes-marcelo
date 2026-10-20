"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { getDevicePlatform, type DevicePlatform } from "@/lib/calendar";

const noopSubscribe = () => () => {};

/** "desktop" on the server and during hydration, so the first render always matches. */
export function useDevicePlatform(): DevicePlatform {
  return useSyncExternalStore(noopSubscribe, getDevicePlatform, () => "desktop");
}

/** Current timestamp, refreshed every minute; null until mounted. */
export function useNow(intervalMs = 60_000): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, intervalMs);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [intervalMs]);
  return now;
}
