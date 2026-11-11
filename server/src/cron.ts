import cron from "node-cron";
import { prisma } from "./db.js";
import { webpush } from "./push.js";

export function startCronJobs() {
  // Теперь проверка запускается КАЖДУЮ МИНУТУ
  cron.schedule("* * * * *", async () => {
    // Получаем текущее время сервера в формате "ЧЧ:ММ" (например, "20:00")
    const now = new Date();
    const currentTime = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Minsk",
    });

    console.log(`⏰ [Cron] Проверка уведомлений на ${currentTime}...`);

    try {
      const allSubs = await prisma.pushSubscription.findMany();
      console.log(
        `📊 В базе ${allSubs.length} подписок. Времена: ${allSubs.map((s) => s.notificationTime).join(", ")}`,
      );
      // Ищем подписки, у которых время совпадает с текущим
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { notificationTime: currentTime },
      });

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
