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
    liveEvents.onmessage = (event) => {
      if (shouldRefresh(event.data)) {
        refreshWhenVisible();
      }
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      liveEvents.close();
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [active, router, streamUrl]);

  return null;
}

function shouldRefresh(data: string) {
  try {
    const event = JSON.parse(data) as { type?: string };

    return (
      event.type === "notification" ||
      event.type === "order-status" ||
      event.type === "admin-order-updated"
    );
  } catch {
    return true;
  }
}
