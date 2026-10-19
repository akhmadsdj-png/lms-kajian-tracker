// Minimal service worker so browsers offer "Install app". It caches nothing:
// every request goes to the network as usual, so users never see stale pages.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
