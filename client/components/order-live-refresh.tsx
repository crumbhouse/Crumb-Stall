"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function OrderLiveRefresh({
  active = true,
  streamUrl = "/api/live/customer",
}: {
  active?: boolean;
  streamUrl?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!active) {
      return;
    }

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };

    const liveEvents = new EventSource(streamUrl);
    liveEvents.onmessage = refreshWhenVisible;
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      liveEvents.close();
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [active, router, streamUrl]);

  return null;
}
