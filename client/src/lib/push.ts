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
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.error("Ошибка: Браузер не поддерживает Push API");
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const registration = await navigator.serviceWorker.ready;
    const res = await fetch("http://localhost:3001/api/push/vapid-public-key");
    if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);
    const { publicKey } = await res.json();

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    await fetch("http://localhost:3001/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });
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
export async function updateNotificationTime(time: string) {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) throw new Error('Нет активной подписки');

  const response = await fetch('http://localhost:3001/api/push/time', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: subscription.endpoint, time }),
  });

  if (!response.ok) throw new Error('Ошибка обновления времени');
  return response.json();
}
export async function getNotificationTime(): Promise<string> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) throw new Error('Нет активной подписки');

  const response = await fetch('http://localhost:3001/api/push/time/get', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  });

  if (!response.ok) throw new Error('Ошибка получения времени');
  const data = await response.json();
  return data.time;
}
