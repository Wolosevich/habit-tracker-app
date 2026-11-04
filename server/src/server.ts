import cors from "@fastify/cors";
import Fastify from "fastify";
import { prisma } from "./db.js";

const fastify = Fastify({
  logger: true,
});
fastify.register(cors, { origin: true });

// Тестовый маршрут (оставляем для проверки)
fastify.get("/api/health", async () => {
  return { status: "ok", message: "Бэкенд трекера привычек работает!" };
});

// НОВЫЙ МАРШРУТ: Получение всех привычек из базы данных
fastify.get("/api/habits", async () => {
  // Просим Prisma найти все записи в таблице Habit
  const habits = await prisma.habit.findMany();
  return habits;
});
// НОВЫЙ МАРШРУТ: Создание привычки
fastify.post("/api/habits", async (request, reply) => {
  // Говорим TypeScript, какие поля мы ожидаем в теле запроса
  const body = request.body as {
    name: string;
    description?: string;
    color: string;
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
      // completedDates по умолчанию будет пустым массивом, как мы указали в схеме
    },
  });

  // Возвращаем созданную привычку (с её id и createdAt)
  return newHabit;
});

// Запуск сервера
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: "0.0.0.0" });
    console.log(`Сервер запущен на http://localhost:3001`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
