/*
  Minimal service worker for Next.js PWA
  - Precache core assets after install
  - Runtime cache: network-first for navigation, stale-while-revalidate for static assets
  - Web Push: show notifications on push events and handle clicks
*/

const CACHE_NAME = "pwa-cache-v1";
const CORE_ASSETS = ["/", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Navigation requests: network first for up-to-date pages
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req)),
    );
    return;
  }

  const url = new URL(req.url);
  // Static assets: stale-while-revalidate
  if (
    url.origin === location.origin &&
    /\.(?:css|js|svg|png|jpg|jpeg|gif|webp|ico|woff2?)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((res) => {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
            return res;
          })
          .catch(() => cached); // fall back to cache if offline
        return cached || fetchPromise;
      }),
    );
  }
});

// Handle push events by showing a notification
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = {
      title: "알림",
      body: event.data && event.data?.text ? event.data.text() : "",
    };
  }
  const title = data.title || "웨잇";
  const options = {
    body: data.body || "새로운 알림이 도착했습니다.",
    icon: "/icon.svg",
    badge: "/icon.svg",
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Focus or open when the notification is clicked
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl =
    (event.notification &&
      event.notification.data &&
      event.notification.data.url) ||
    "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === targetUrl && "focus" in client)
            return client.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
      }),
  );
});
