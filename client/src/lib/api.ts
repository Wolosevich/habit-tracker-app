const API_URL = "https://habit-tracker-app-z4x7.onrender.com/api";

// Получить все привычки
export async function fetchHabits() {
  const response = await fetch(`${API_URL}/habits`);
  if (!response.ok) throw new Error("Ошибка при загрузке привычек");
  return response.json();
}

// Создать привычку
export async function createHabit(data: {
  name: string;
  description?: string;
  color: string;
}) {
  const response = await fetch(`${API_URL}/habits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Ошибка при создании привычки");
  return response.json();
}

// Удалить привычку
export async function deleteHabit(id: string) {
  const response = await fetch(`${API_URL}/habits/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Ошибка при удалении привычки");
  return response.json();
}

// Обновить привычку (название, цвет или массив дат)
export async function updateHabit(id: string, data: any) {
  const response = await fetch(`${API_URL}/habits/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Ошибка при обновлении привычки");
  return response.json();
}
import type { Habit } from "../types/habit"; // Убедитесь, что этот импорт есть в начале файла

export async function importHabitsApi(habits: Habit[]) {
  const response = await fetch(`${API_URL}/habits/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(habits),
  });
  if (!response.ok) throw new Error("Ошибка при импорте привычек на сервер");
  return response.json();
}
