import type { RecoverCheckoutOrderPayload } from "@/lib/payments";

const PENDING_CHECKOUT_KEY = "crumbstall-pending-checkout";
const CHECKOUT_ATTEMPT_KEY = "crumbstall-checkout-attempt-id";

export type PendingCheckout = RecoverCheckoutOrderPayload;

export function savePendingCheckout(checkout: PendingCheckout) {
  try {
    window.sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(checkout));
  } catch {
    // Recovery is best-effort; checkout should continue even if storage is blocked.
  }
}

export function readPendingCheckout() {
  try {
    const savedCheckout = window.sessionStorage.getItem(PENDING_CHECKOUT_KEY);

    return savedCheckout ? (JSON.parse(savedCheckout) as PendingCheckout) : null;
  } catch {
    return null;
  }
}

export function clearPendingCheckout() {
  try {
    window.sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
  } catch {
    // Nothing to clear.
  }
}

export function getOrCreateCheckoutAttemptId() {
  try {
    const existingAttemptId = window.sessionStorage.getItem(CHECKOUT_ATTEMPT_KEY);

    if (existingAttemptId) {
      return existingAttemptId;
    }

    const attemptId =
      window.crypto?.randomUUID?.() ?? `attempt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(CHECKOUT_ATTEMPT_KEY, attemptId);

    return attemptId;
  } catch {
    return `attempt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}

export function clearCheckoutAttemptId() {
  try {
    window.sessionStorage.removeItem(CHECKOUT_ATTEMPT_KEY);
  } catch {
    // Nothing to clear.
  }
}
