import cors from "@fastify/cors";
import "dotenv/config";
import Fastify from "fastify";
import { createClient } from "@supabase/supabase-js"; // 👈 Добавили импорт
import { startCronJobs } from "./cron.js";
import { prisma } from "./db.js";
import { webpush } from "./push.js";

// 👇 ДОБАВЬТЕ ЭТОТ БЛОК СЮДА 👇
declare module "fastify" {
  interface FastifyRequest {
    userId?: string; // Говорим TypeScript, что в request теперь есть userId
  }
}
// 👆 КОНЕЦ БЛОКА 👆

// Инициализируем клиент Supabase для бэкенда

// Инициализируем клиент Supabase для бэкенда
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

const fastify = Fastify({
  logger: true,
});
fastify.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

// Хук для проверки токена перед защищенными маршрутами
const authenticate = async (request: any, reply: any) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Не авторизован (нет токена)' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return reply.status(401).send({ error: 'Неверный токен авторизации' });
  }

  request.userId = user.id;
};

// --- ПУБЛИЧНЫЕ МАРШРУТЫ ---

fastify.get("/api/health", async () => {
  return { status: "ok", message: "Бэкенд трекера привычек работает!" };
});

fastify.get("/api/push/vapid-public-key", async () => {
  return { publicKey: process.env.VAPID_PUBLIC_KEY };
});

// --- МАРШРУТЫ ПОДПИСОК (пока оставим без строгой авторизации для простоты) ---
// В будущем их тоже нужно привязать к userId
fastify.post("/api/push/subscribe", async (request, reply) => {
  const body = request.body as any;
  const { endpoint, keys } = body;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return reply.status(400).send({ error: "Неверный формат подписки" });
  }

  try {
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh: keys.p256dh, auth: keys.auth, userId: request.userId },
      create: { endpoint, p256dh: keys.p256dh, auth: keys.auth, userId: request.userId! },
    });
    return { success: true };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: "Ошибка сохранения подписки" });
  }
});

fastify.delete("/api/push/unsubscribe", async (request, reply) => {
  const { endpoint } = request.body as { endpoint: string };
  if (!endpoint) return reply.status(400).send({ error: "Не передан endpoint" });

  try {
    await prisma.pushSubscription.deleteMany({ where: { endpoint } });
    return { success: true };
  } catch (error) {
    return reply.status(500).send({ error: "Ошибка удаления подписки" });
  }
});

fastify.put("/api/push/time", async (request, reply) => {
  const { endpoint, time } = request.body as { endpoint: string; time: string };
  if (!endpoint || !time) return reply.status(400).send({ error: "Не передан endpoint или time" });

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

fastify.post("/api/push/time/get", async (request, reply) => {
  const { endpoint } = request.body as { endpoint: string };
  if (!endpoint) return reply.status(400).send({ error: "Не передан endpoint" });

  try {
    const sub = await prisma.pushSubscription.findUnique({ where: { endpoint } });
    if (!sub) return reply.status(404).send({ error: "Подписка не найдена" });
    return { time: sub.notificationTime };
  } catch (error) {
    return reply.status(500).send({ error: "Ошибка получения времени" });
  }
});


// --- ЗАЩИЩЕННЫЕ МАРШРУТЫ ПРИВЫЧЕК ---

// Получение ТОЛЬКО СВОИХ привычек
fastify.get("/api/habits", { preHandler: authenticate }, async (request: any) => {
  const habits = await prisma.habit.findMany({
    where: { userId: request.userId }
  });
  return habits;
});

// Создание привычки
fastify.post("/api/habits", { preHandler: authenticate }, async (request: any, reply) => {
  const body = request.body as { name: string; description?: string; color: string; icon?: string };

  if (!body.name || !body.color) {
    return reply.status(400).send({ error: "Поля name и color обязательны" });
  }

  const newHabit = await prisma.habit.create({
    data: {
      userId: request.userId,
      name: body.name,
      description: body.description,
      color: body.color,
      icon: body.icon || "target",
    },
  });

  return newHabit;
});

// Импорт привычек
fastify.post("/api/habits/import", { preHandler: authenticate }, async (request: any, reply) => {
  const habits = request.body as any[];

  if (!Array.isArray(habits)) {
    return reply.status(400).send({ error: "Ожидается массив привычек" });
  }

  try {
    const dataToInsert = habits.map((h) => ({
      userId: request.userId, // 👈 Привязываем импортированные привычки к пользователю
      id: h.id,
      name: h.name,
      description: h.description || null,
      color: h.color || "blue",
      icon: h.icon || "target",
      createdAt: h.createdAt ? new Date(h.createdAt) : new Date(),
      completedDates: h.completedDates || [],
    }));

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

// Обновление привычки
fastify.put("/api/habits/:id", { preHandler: authenticate }, async (request: any, reply) => {
  const { id } = request.params as { id: string };
  const body = request.body as {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    completedDates?: string[];
  };

  try {
    // Проверяем, что привычка принадлежит именно этому пользователю
    const updatedHabit = await prisma.habit.updateMany({
      where: { id, userId: request.userId },
      data: body,
    });

    if (updatedHabit.count === 0) {
      return reply.status(404).send({ error: "Привычка не найдена или нет прав" });
    }

    // Возвращаем обновленную привычку
    const habit = await prisma.habit.findUnique({ where: { id } });
    return habit;
  } catch (error) {
    return reply.status(404).send({ error: "Привычка не найдена" });
  }
});

// Удаление привычки
fastify.delete("/api/habits/:id", { preHandler: authenticate }, async (request: any, reply) => {
  const { id } = request.params as { id: string };

  try {
    // Проверяем, что привычка принадлежит именно этому пользователю
    const deleted = await prisma.habit.deleteMany({
      where: { id, userId: request.userId }
    });

    if (deleted.count === 0) {
      return reply.status(404).send({ error: "Привычка не найдена или нет прав" });
    }

    return { success: true };
  } catch (error) {
    return reply.status(404).send({ error: "Привычка не найдена" });
  }
});

// Запускаем фоновые задачи
startCronJobs();

// Запуск сервера
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log(`Сервер запущен на порту ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();