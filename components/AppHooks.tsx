"use client";
import { useLayersSubscription } from "@/hooks/useLayersSubscription";
import { useLogsSubscription } from "@/hooks/useLogsSubscription";
import { useRecommendationsSubscription } from "@/hooks/useRecommendationsSubscription";
import {
  useGlobalSubscription,
  useGeolocation,
  useWeather,
  useAddress,
} from "@/hooks/useGlobalSubscription";

/**
 * AppHooks component that mounts all global subscription and utility hooks.
 * This ensures these hooks run regardless of which view is active on mobile.
 */
export default function AppHooks() {
  // Mount all the hooks that need to run globally
  useGeolocation();
  useWeather();
  useLayersSubscription();
  useLogsSubscription();
  useRecommendationsSubscription();
  useGlobalSubscription();
  useAddress();

  // This component doesn't render anything visible
  return null;
}
