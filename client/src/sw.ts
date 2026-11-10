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
// Обработчик клика по уведомлению
self.addEventListener("notificationclick", function (event) {
  // Закрываем само уведомление с экрана
  event.notification.close();

  // Открываем или фокусируем приложение
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Если приложение уже открыто в какой-то вкладке, фокусируемся на нем
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        // Если приложение закрыто, открываем его (главную страницу)
        if (self.clients.openWindow) {
          return self.clients.openWindow("/");
        }
      }),
  );
});
