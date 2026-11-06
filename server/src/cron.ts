import cron from "node-cron";
import { prisma } from "./db.js";
import { webpush } from "./push.js";

export function startCronJobs() {
  // Настраиваем расписание. Сейчас стоит тестовый режим: КАЖДУЮ МИНУТУ.
  // Позже мы поменяем его на раз в день (например, '0 20 * * *' — каждый день в 20:00).
  cron.schedule("0 20 * * *", async () => {
    console.log("⏰ [Cron] Проверка привычек и отправка напоминаний...");

    try {
      const subscriptions = await prisma.pushSubscription.findMany();

      if (subscriptions.length > 0) {
        const payload = JSON.stringify({
          title: "Трекер привычек",
          body: "Самое время отметить свои привычки! 🔥",
        });

        for (const sub of subscriptions) {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth },
              },
              payload,
            );
          } catch (error: any) {
            if (error.statusCode === 410) {
              // Если браузер отписался, удаляем из базы
              await prisma.pushSubscription.delete({ where: { id: sub.id } });
            }
          }
        }
        console.log(
          `✅ [Cron] Отправлено на ${subscriptions.length} устройств.`,
        );
      }
    } catch (error) {
      console.error("Ошибка в Cron-задаче:", error);
    }
  });
}
