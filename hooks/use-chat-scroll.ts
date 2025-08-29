"use client";
import { useEffect, useRef } from "react";

export function useChatScroll<T extends HTMLElement>(dep: any) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [dep]);
  return ref;
}


