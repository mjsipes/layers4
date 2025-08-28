"use client";

import { useViewportHeight } from '@/hooks/useViewportHeight';

export function ViewportHeightProvider() {
  useViewportHeight();
  return null;
}
