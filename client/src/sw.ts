/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";

declare let self: ServiceWorkerGlobalScope;

// 1. Кэшируем файлы приложения (это делает плагин для работы офлайн)
precacheAndRoute(self.__WB_MANIFEST);

// 2. Наш код для Push-уведомлений
self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/vite.svg",
      badge: "/vite.svg",
      vibrate: [200, 100, 200],
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});
