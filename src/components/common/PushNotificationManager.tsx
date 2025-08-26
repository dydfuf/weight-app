"use client";

import { useState, useEffect } from "react";
import {
  subscribeUser,
  unsubscribeUser,
  sendNotification,
} from "@/actions/web-push/actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData =
    typeof window !== "undefined"
      ? window.atob(base64)
      : Buffer.from(base64, "base64").toString("binary");
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState("");

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as
    | string
    | undefined;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      // Read existing subscription when SW is ready (global registration happens in layout)
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => setSubscription(sub))
        .catch((e) => console.error("Get subscription error", e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function ensurePermission(): Promise<boolean> {
    if (typeof Notification === "undefined") return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const result = await Notification.requestPermission();
    return result === "granted";
  }

  async function subscribeToPush() {
    try {
      if (!publicKey) {
        alert("환경 변수 NEXT_PUBLIC_VAPID_PUBLIC_KEY 가 설정되지 않았습니다.");
        return;
      }
      const permitted = await ensurePermission();
      if (!permitted) {
        alert(
          "알림 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요."
        );
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      setSubscription(sub);
      const serializedSub = JSON.parse(JSON.stringify(sub));
      await subscribeUser(serializedSub);
    } catch (e) {
      console.error("Subscribe error", e);
    }
  }

  async function unsubscribeFromPush() {
    try {
      const endpoint = subscription?.endpoint || "";
      await subscription?.unsubscribe();
      setSubscription(null);
      if (endpoint) await unsubscribeUser(endpoint);
    } catch (e) {
      console.error("Unsubscribe error", e);
    }
  }

  async function sendTestNotification() {
    try {
      if (subscription) {
        await sendNotification(message, "/");
        setMessage("");
      }
    } catch (e) {
      console.error("Send notification error", e);
    }
  }

  if (!isSupported) {
    return <p>이 브라우저는 푸시 알림을 지원하지 않습니다.</p>;
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-sm">
      <h3 className="text-base font-semibold">푸시 알림</h3>
      {!publicKey && (
        <p className="text-sm text-red-600">
          환경 변수 NEXT_PUBLIC_VAPID_PUBLIC_KEY 가 누락되었습니다.
        </p>
      )}
      {subscription ? (
        <>
          <p className="text-sm">푸시 알림에 구독되었습니다.</p>
          <button
            type="button"
            className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-800"
            onClick={unsubscribeFromPush}
          >
            구독 해지
          </button>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="전송할 메시지를 입력하세요"
              className="flex-1 px-2 py-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="button"
              className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
              disabled={!message}
              onClick={sendTestNotification}
            >
              테스트 전송
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm">푸시 알림을 받으려면 구독하세요.</p>
          <button
            type="button"
            className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            disabled={!publicKey}
            onClick={subscribeToPush}
          >
            구독하기
          </button>
        </>
      )}
    </div>
  );
}
