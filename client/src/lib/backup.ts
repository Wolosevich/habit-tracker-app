import type { Habit } from "../types/habit";

/**
 * Скачивает массив привычек в виде JSON-файла.
 */
export function downloadHabits(habits: Habit[]): void {
  const dataStr = JSON.stringify(habits, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `habit-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Читает JSON-файл и возвращает массив привычек.
 * Валидирует базовую структуру, чтобы не сломать приложение битым файлом.
 */
export function readHabitsFromFile(file: File): Promise<Habit[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);

        // Базовая проверка, что это массив и у элементов есть нужные поля
        if (!Array.isArray(parsed)) {
          throw new Error("Файл должен содержать массив привычек.");
        }

        const isValid = parsed.every(
          (item) =>
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            typeof item.color === "string" &&
            Array.isArray(item.completedDates),
        );

        if (!isValid) {
          throw new Error("Некорректный формат данных в файле.");
        }

        resolve(parsed as Habit[]);
      } catch (err) {
        reject(
          new Error("Не удалось прочитать файл: " + (err as Error).message),
        );
      }
    };

    reader.onerror = () => reject(new Error("Ошибка при чтении файла."));
    reader.readAsText(file);
  });
}
