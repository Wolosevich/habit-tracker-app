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
  console.log("1. Начинаем процесс подписки...");

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.error("Ошибка: Браузер не поддерживает Push API");
    alert("Ваш браузер не поддерживает уведомления");
    return;
  }

  try {
    console.log("2. Запрашиваем разрешение...");
    const permission = await Notification.requestPermission();
    console.log("Результат разрешения:", permission);

    if (permission !== "granted") {
      alert("Вы отклонили уведомления");
      return;
    }

    console.log("3. Ждем готовности Service Worker...");
    const registration = await navigator.serviceWorker.ready;
    console.log("4. Service Worker готов:", registration);

    console.log("5. Запрашиваем VAPID ключ с сервера...");
    const res = await fetch("http://localhost:3001/api/push/vapid-public-key");
    if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);
    const { publicKey } = await res.json();
    console.log("6. Ключ получен:", publicKey);

    console.log("7. Создаем подписку в браузере...");
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    console.log("8. Подписка создана:", subscription);

    console.log("9. Отправляем на сервер...");
    const subRes = await fetch("http://localhost:3001/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });
    console.log("10. Ответ сервера на сохранение:", subRes.status);
  } catch (err) {
    console.error("❌ ОШИБКА ПРИ ПОДПИСКЕ:", err);
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
      await subscription.unsubscribe();
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
