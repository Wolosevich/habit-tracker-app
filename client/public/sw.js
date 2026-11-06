// Этот код работает в фоне, даже когда вкладка закрыта
self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/vite.svg", // Пока используем иконку Vite
      badge: "/vite.svg",
      vibrate: [200, 100, 200],
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});
