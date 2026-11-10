import type { Habit } from "../types/habit";
import { toDateKey } from "./date"; // Импортируем утилиту

export function getMonthlyStats(habits: Habit[]) {
  if (habits.length === 0) return { completed: 0, total: 0, percentage: 0 };

  const today = new Date();
  const todayKey = toDateKey(today); // Формат 'YYYY-MM-DD'
  const currentMonthPrefix = todayKey.slice(0, 7); // 'YYYY-MM'

  let totalCompleted = 0;
  let totalPossible = 0;

  habits.forEach((habit) => {
    // 1. Убираем дубликаты и берем только даты этого месяца, которые не в будущем
    const uniqueCompletedThisMonth = new Set(
      habit.completedDates.filter(
        (d) => d.startsWith(currentMonthPrefix) && d <= todayKey,
      ),
    );
    totalCompleted += uniqueCompletedThisMonth.size;

    // 2. Считаем доступные дни
    const createdAtDate = new Date(habit.createdAt);
    const isCreatedThisMonth =
      createdAtDate.getMonth() === today.getMonth() &&
      createdAtDate.getFullYear() === today.getFullYear();

    const startDay = isCreatedThisMonth ? createdAtDate.getDate() : 1;
    const daysActive = today.getDate() - startDay + 1;

    totalPossible += Math.max(0, daysActive);
  });

  // 3. Защита от 106%: берем минимум из 100 и реального процента
  const percentage =
    totalPossible > 0
      ? Math.min(100, Math.round((totalCompleted / totalPossible) * 100))
      : 0;

  return { completed: totalCompleted, total: totalPossible, percentage };
}
