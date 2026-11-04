import { PrismaClient } from "@prisma/client";

// Создаем и экспортируем единый экземпляр Prisma Client
export const prisma = new PrismaClient();
