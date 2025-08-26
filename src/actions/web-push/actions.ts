"use server";

import webpush, { type PushSubscription as WPPushSubscription } from "web-push";

// Types for serialized PushSubscription
export type PushSubscriptionJSON = {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:dev@localhost",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
  );
}

// In-memory subscription store (replace with DB in production)
const subscriptions = new Map<string, PushSubscriptionJSON>();

export async function subscribeUser(subscription: PushSubscriptionJSON) {
  if (!subscription?.endpoint) {
    return { ok: false, error: "Invalid subscription" } as const;
  }
  subscriptions.set(subscription.endpoint, subscription);
  return { ok: true } as const;
}

export async function unsubscribeUser(endpoint: string) {
  if (!endpoint) return { ok: false, error: "Missing endpoint" } as const;
  subscriptions.delete(endpoint);
  return { ok: true } as const;
}

export async function sendNotification(message: string, url?: string) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return {
      ok: false,
      error: "VAPID keys are not configured on server",
    } as const;
  }

  const payload = JSON.stringify({
    title: "웨잇",
    body: message || "새로운 알림이 도착했습니다.",
    url: url || "/",
  });

  let success = 0;
  let removed = 0;
  const failures: { endpoint: string; error: string }[] = [];

  for (const [endpoint, sub] of subscriptions.entries()) {
    try {
      await webpush.sendNotification(
        sub as unknown as WPPushSubscription,
        payload,
      );
      success += 1;
    } catch (err: any) {
      const status = err?.statusCode ?? err?.code;
      // Clean up stale subscriptions
      if (status === 404 || status === 410) {
        subscriptions.delete(endpoint);
        removed += 1;
      } else {
        failures.push({ endpoint, error: String(err?.message ?? err) });
      }
    }
  }

  return { ok: true, success, removed, failures } as const;
}
