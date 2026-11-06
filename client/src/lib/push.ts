// Вспомогательная функция для конвертации ключа (требование браузера)
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush() {
  // 1. Проверяем поддержку браузера
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    alert(
      "Ваш браузер не поддерживает уведомления / Push notifications are not supported",
    );
    return;
  }

  try {
    // 2. Запрашиваем разрешение у пользователя
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("Вы отклонили уведомления / Permission denied");
      return;
    }

    // 3. Регистрируем Service Worker
    const registration = await navigator.serviceWorker.register("/sw.js");

    // 4. Получаем публичный ключ с бэкенда
    const res = await fetch("http://localhost:3001/api/push/vapid-public-key");
    const { publicKey } = await res.json();

    // 5. Подписываемся на Push-уведомления
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    console.log("Подписка создана! Данные для бэкенда:", subscription);
    // Отправляем данные подписки на наш бэкенд
    await fetch("http://localhost:3001/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });

    //alert("Уведомления успешно включены и сохранены на сервере!");

    // Пока просто выведем в консоль. На следующем шаге мы отправим это на бэкенд.
    //alert("Уведомления успешно включены! (Проверьте консоль)");
  } catch (err) {
    console.error("Ошибка при подписке на уведомления:", err);
  }
}
export async function checkSubscription() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window))
    return false;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
}
export async function unsubscribeFromPush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // 1. Отписываемся в браузере
      await subscription.unsubscribe();

      // 2. Сообщаем бэкенду, чтобы он удалил нас из базы
      await fetch("http://localhost:3001/api/push/unsubscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
    }
  } catch (err) {
    console.error("Ошибка при отписке:", err);
  }
}
