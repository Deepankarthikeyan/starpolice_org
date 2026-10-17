"use client";

import { useEffect, useRef, useState } from "react";

export const AUTO_SLIDER_INTERVAL_MS = 20000;

export function useAutoSliderPause() {
  const [isPaused, setIsPaused] = useState(false);

  return {
    isPaused,
    pauseProps: {
      onMouseEnter: () => setIsPaused(true),
      onMouseLeave: () => setIsPaused(false),
    },
  };
}

export function useAutoSliderInterval(onAdvance, isPaused, deps = []) {
  const onAdvanceRef = useRef(onAdvance);

  useEffect(() => {
    onAdvanceRef.current = onAdvance;
  }, [onAdvance]);

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      onAdvanceRef.current();
    }, AUTO_SLIDER_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, ...deps]);
}
