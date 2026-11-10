import cors from "@fastify/cors";
import "dotenv/config";
import Fastify from "fastify";
import { startCronJobs } from "./cron.js";
import { prisma } from "./db.js";
import { webpush } from "./push.js";

const fastify = Fastify({
  logger: true,
});
fastify.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

// Тестовый маршрут (оставляем для проверки)
fastify.get("/api/health", async () => {
  return { status: "ok", message: "Бэкенд трекера привычек работает!" };
});

// Маршрут для получения публичного VAPID-ключа
fastify.get("/api/push/vapid-public-key", async () => {
  return { publicKey: process.env.VAPID_PUBLIC_KEY };
});

// Маршрут для сохранения подписки
fastify.post("/api/push/subscribe", async (request, reply) => {
  const body = request.body as any; // В идеале здесь нужна строгая типизация, но для MVP сойдет
  const { endpoint, keys } = body;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return reply.status(400).send({ error: "Неверный формат подписки" });
  }

  try {
    // Сохраняем или обновляем подписку (если такое устройство уже подписано)
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh: keys.p256dh, auth: keys.auth },
      create: { endpoint, p256dh: keys.p256dh, auth: keys.auth },
    });
    return { success: true };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: "Ошибка сохранения подписки" });
  }
});

// Маршрут для удаления подписки
fastify.delete("/api/push/unsubscribe", async (request, reply) => {
  const { endpoint } = request.body as { endpoint: string };

  if (!endpoint) {
    return reply.status(400).send({ error: "Не передан endpoint" });
  }

  try {
    // Используем deleteMany, чтобы не упасть с ошибкой, если записи вдруг нет
    await prisma.pushSubscription.deleteMany({ where: { endpoint } });
    return { success: true };
  } catch (error) {
    return reply.status(500).send({ error: "Ошибка удаления подписки" });
  }
});

// Маршрут для обновления времени уведомлений
fastify.put("/api/push/time", async (request, reply) => {
  const { endpoint, time } = request.body as { endpoint: string; time: string };

  if (!endpoint || !time) {
    return reply.status(400).send({ error: "Не передан endpoint или time" });
  }

  try {
    await prisma.pushSubscription.updateMany({
      where: { endpoint },
      data: { notificationTime: time },
    });
    return { success: true };
  } catch (error) {
    return reply.status(500).send({ error: "Ошибка обновления времени" });
  }
});

// Маршрут для получения текущего времени уведомлений
fastify.post("/api/push/time/get", async (request, reply) => {
  const { endpoint } = request.body as { endpoint: string };

  if (!endpoint) {
    return reply.status(400).send({ error: "Не передан endpoint" });
  }

  try {
    const sub = await prisma.pushSubscription.findUnique({
      where: { endpoint },
    });
    if (!sub) {
      return reply.status(404).send({ error: "Подписка не найдена" });
    }
    return { time: sub.notificationTime };
  } catch (error) {
    return reply.status(500).send({ error: "Ошибка получения времени" });
  }
});

// Маршрут для тестовой отправки уведомлений
fastify.post("/api/push/test", async (request, reply) => {
  try {
    // 1. Получаем все подписки из базы
    const subscriptions = await prisma.pushSubscription.findMany();

    if (subscriptions.length === 0) {
      return reply.status(404).send({ error: "Нет активных подписок" });
    }

    // 2. Формируем сообщение
    const payload = JSON.stringify({
      title: "Трекер привычек",
      body: "Не забудьте выполнить свои привычки сегодня! 🔥",
    });

    // 3. Отправляем уведомление на каждое устройство
    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
        );
      } catch (error: any) {
        // Если подписка устарела (ошибка 410), удаляем её из базы
        if (error.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
      }
    });

    await Promise.all(sendPromises);
    return {
      success: true,
      message: `Отправлено на ${subscriptions.length} устройств`,
    };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: "Ошибка отправки уведомлений" });
  }
});

// НОВЫЙ МАРШРУТ: Получение всех привычек из базы данных
fastify.get("/api/habits", async () => {
  // Просим Prisma найти все записи в таблице Habit
  const habits = await prisma.habit.findMany();
  return habits;
});

// Маршрут для массового импорта привычек
fastify.post("/api/habits/import", async (request, reply) => {
  const habits = request.body as any[];

  if (!Array.isArray(habits)) {
    return reply.status(400).send({ error: "Ожидается массив привычек" });
  }

  try {
    // Подготавливаем данные (на случай, если в JSON не хватает каких-то полей)
    const dataToInsert = habits.map((h) => ({
      id: h.id,
      name: h.name,
      description: h.description || null,
      color: h.color || "blue",
      createdAt: h.createdAt ? new Date(h.createdAt) : new Date(),
      completedDates: h.completedDates || [],
    }));

    // createMany позволяет вставить сразу много записей.
    // skipDuplicates: true предотвратит ошибку, если вы импортируете те же самые привычки
    const result = await prisma.habit.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    });

    return { success: true, count: result.count };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: "Ошибка при импорте данных" });
  }
});
// НОВЫЙ МАРШРУТ: Создание привычки
fastify.post("/api/habits", async (request, reply) => {
  // Говорим TypeScript, какие поля мы ожидаем в теле запроса
  const body = request.body as {
    name: string;
    description?: string;
    color: string;
    icon?: string;
  };

  // Простейшая валидация на сервере
  if (!body.name || !body.color) {
    return reply.status(400).send({ error: "Поля name и color обязательны" });
  }

  // Создаем привычку в базе данных
  const newHabit = await prisma.habit.create({
    data: {
      name: body.name,
      description: body.description,
      color: body.color,
      icon: body.icon || "target",
      // completedDates по умолчанию будет пустым массивом, как мы указали в схеме
    },
  });

  // Возвращаем созданную привычку (с её id и createdAt)
  return newHabit;
});

// Запускаем фоновые задачи
startCronJobs();
// Запуск сервера
const start = async () => {
  try {
    // 👇 Render сам передает порт через переменную окружения PORT
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;

    // 👇 Слушаем на всех интерфейсах, чтобы Render мог достучаться до приложения
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log(`Сервер запущен на порту ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
// МАРШРУТ: Удаление привычки
fastify.delete("/api/habits/:id", async (request, reply) => {
  const { id } = request.params as { id: string };

  try {
    await prisma.habit.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return reply.status(404).send({ error: "Привычка не найдена" });
  }
});

// МАРШРУТ: Обновление привычки (название, цвет или отметки)
fastify.put("/api/habits/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const body = request.body as {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    completedDates?: string[];
  };

  try {
    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: body,
    });
    return updatedHabit;
  } catch (error) {
    return reply.status(404).send({ error: "Привычка не найдена" });
  }
});

start();
