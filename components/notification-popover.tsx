"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  readAt: string | null;
  metadata: {
    orderNumber?: string;
  } | null;
  createdAt: string;
};

type NotificationResponse = {
  data: Notification[];
  meta: {
    unreadCount: number;
  };
};

export function NotificationPopover() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dismissedToastId, setDismissedToastId] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const isSignedIn = status === "authenticated";

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    void loadNotifications({ showLoading: true });
    const liveEvents = new EventSource("/api/live/customer");
    liveEvents.onmessage = (event) => {
      if (isNotificationEvent(event.data)) {
        void loadNotifications();
      }
    };

    return () => liveEvents.close();
  }, [isSignedIn]);

  const latestUnread = useMemo(
    () => notifications.find((notification) => !notification.readAt),
    [notifications],
  );

  const shouldShowLatestToast =
    Boolean(latestUnread) && !open && latestUnread?.id !== dismissedToastId;

  useEffect(() => {
    if (!latestUnread || open) {
      return;
    }

    const notificationId = latestUnread.id;
    const timeoutId = window.setTimeout(() => setDismissedToastId(notificationId), 5000);

    return () => window.clearTimeout(timeoutId);
  }, [latestUnread, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!popoverRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  if (!isSignedIn) {
    return null;
  }

  async function loadNotifications({ showLoading = false }: { showLoading?: boolean } = {}) {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const response = await fetch("/api/notifications?limit=5", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as NotificationResponse;
      setNotifications(payload.data ?? []);
      setUnreadCount(Number(payload.meta?.unreadCount) || 0);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }

  async function markAllRead() {
    const previousUnreadCount = unreadCount;
    setUnreadCount(0);
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        readAt: notification.readAt ?? new Date().toISOString(),
      })),
    );

    const response = await fetch("/api/notifications", {
      method: "PATCH",
    });

    if (!response.ok) {
      setUnreadCount(previousUnreadCount);
      void loadNotifications();
    }
  }

  async function markRead(notificationId: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, readAt: notification.readAt ?? new Date().toISOString() }
          : notification,
      ),
    );
    setUnreadCount((current) => Math.max(0, current - 1));

    const response = await fetch(`/api/notifications/${encodeURIComponent(notificationId)}/read`, {
      method: "PATCH",
    });

    if (!response.ok) {
      void loadNotifications();
    }
  }

  return (
    <div ref={popoverRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          void loadNotifications({ showLoading: true });
        }}
        className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-[#e8e8e3] bg-white text-[#171717] transition hover:border-[#d21f32] hover:text-[#d21f32]"
        aria-expanded={open}
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-[#d21f32] px-1.5 py-0.5 text-[10px] font-black leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {latestUnread && shouldShowLatestToast ? (
        <div className="pointer-events-none absolute right-0 top-12 hidden w-72 rounded-lg border border-[#ffe0e4] bg-white p-3 text-sm shadow-[0_18px_50px_rgba(0,0,0,0.16)] lg:block">
          <p className="font-black text-[#171717]">{latestUnread.title}</p>
          <p className="mt-1 max-h-10 overflow-hidden font-semibold text-[#646464]">
            {latestUnread.message}
          </p>
        </div>
      ) : null}

      {open ? (
        <div className="fixed right-3 top-20 z-50 w-[min(22rem,calc(100vw-1.5rem))] rounded-lg border border-[#e8e8e3] bg-white p-4 shadow-[0_22px_70px_rgba(0,0,0,0.18)] sm:absolute sm:right-0 sm:top-12 sm:w-[min(22rem,calc(100vw-2rem))]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#d21f32]">
                Notifications
              </p>
              <p className="mt-1 text-xs font-semibold text-[#646464]">
                {unreadCount} unread update{unreadCount === 1 ? "" : "s"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void markAllRead()}
              disabled={unreadCount === 0}
              className="rounded-full bg-[#f6f6f4] px-3 py-2 text-xs font-black text-[#171717] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Mark read
            </button>
          </div>

          <div className="mt-4 max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <p className="rounded-lg bg-[#f6f6f4] p-4 text-sm font-semibold text-[#646464]">
                Loading notifications...
              </p>
            ) : notifications.length === 0 ? (
              <p className="rounded-lg bg-[#f6f6f4] p-4 text-sm font-semibold text-[#646464]">
                No updates yet. Order alerts will appear here after checkout.
              </p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={markRead}
                    onClose={() => setOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function isNotificationEvent(data: string) {
  try {
    const event = JSON.parse(data) as { type?: string };

    return event.type === "notification";
  } catch {
    return true;
  }
}

function NotificationItem({
  notification,
  onMarkRead,
  onClose,
}: {
  notification: Notification;
  onMarkRead: (notificationId: string) => Promise<void>;
  onClose: () => void;
}) {
  const orderNumber = notification.metadata?.orderNumber;
  const content = (
    <>
      <span
        className={`mt-1 size-2 shrink-0 rounded-full ${
          notification.readAt ? "bg-[#d7d7cf]" : "bg-[#d21f32]"
        }`}
      />
      <span className="min-w-0">
        <span className="block font-black text-[#171717]">{notification.title}</span>
        <span className="mt-1 block text-sm font-semibold text-[#646464]">
          {notification.message}
        </span>
        <span className="mt-2 block text-xs font-bold text-[#666666]">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </span>
    </>
  );

  if (orderNumber) {
    return (
      <Link
        href={`/orders/${orderNumber}`}
        onClick={() => {
          if (!notification.readAt) {
            void onMarkRead(notification.id);
          }
          onClose();
        }}
        className="flex gap-3 rounded-lg border border-[#eeeeea] p-3 transition hover:border-[#d21f32] hover:bg-[#fff8f9]"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (!notification.readAt) {
          void onMarkRead(notification.id);
        }
      }}
      className="flex w-full gap-3 rounded-lg border border-[#eeeeea] p-3 text-left transition hover:border-[#d21f32] hover:bg-[#fff8f9]"
    >
      {content}
    </button>
  );
}

function formatRelativeTime(value: string) {
  const timestamp = new Date(value).getTime();
  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (diffSeconds < 60) {
    return "Just now";
  }

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
