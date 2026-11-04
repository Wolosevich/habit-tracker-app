export function todayKey(): string {
  return toDateKey(new Date());
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
/**
 * Возвращает массив дат за последние n дней в формате YYYY-MM-DD.
 * Порядок: от самой старой к сегодняшней.
 */
export function lastNDays(n: number): string[] {
  const result: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    result.push(toDateKey(d));
  }
  return result;
}
/**
 * Вычисляет текущую серию дней подряд.
 * Если сегодня ещё не выполнено, но выполнено вчера — серия считается
 * активной (чтобы она не обнулялась посреди дня).
 */
export function calculateStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const datesSet = new Set(completedDates);
  let streak = 0;

  const today = new Date();
  const todayStr = toDateKey(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateKey(yesterday);

  let currentDate = new Date(today);

  // Если сегодня не сделано, но вчера сделано — начинаем счёт со вчера.
  if (!datesSet.has(todayStr) && datesSet.has(yesterdayStr)) {
    currentDate = yesterday;
  } else if (!datesSet.has(todayStr) && !datesSet.has(yesterdayStr)) {
    // Если нет ни сегодня, ни вчера — серия прервалась.
    return 0;
  }

  // Идём назад по дням, пока привычка выполнялась
  while (true) {
    const dateStr = toDateKey(currentDate);
    if (datesSet.has(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
/**
 * Возвращает массив дат текущего месяца в формате YYYY-MM-DD.
 * Начинается с понедельника (или null для пустых клеток в начале месяца).
 */
export function getCurrentMonthDays(): (string | null)[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // День недели 1-го числа (0 - Вс, 1 - Пн).
  // Переводим в формат, где Пн = 0, Вс = 6.
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

  // Пустые клетки в начале
  const emptySlots = Array(startDayOfWeek).fill(null);

  // Все дни месяца
  const days = Array.from({ length: lastDayOfMonth.getDate() }, (_, i) =>
    toDateKey(new Date(year, month, i + 1)),
  );

  return [...emptySlots, ...days];
}
