import { supabase } from './supabase';
import type { Habit } from "../types/habit";

const API_URL = "https://habit-tracker-app-z4x7.onrender.com/api";

// Хелпер для получения заголовков авторизации
async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    console.warn("Токен не найден. Пользователь не авторизован?");
    return {};
  }

  return {
    'Authorization': `Bearer ${session.access_token}`,
  };
}

// Получить все привычки
export async function fetchHabits() {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`${API_URL}/habits`, {
    headers: { ...authHeaders }
  });
  if (!response.ok) throw new Error("Ошибка при загрузке привычек");
  return response.json();
}

// Создать привычку
export async function createHabit(data: {
  name: string;
  description?: string;
  color: string;
}) {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`${API_URL}/habits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Ошибка при создании привычки");
  return response.json();
}

// Удалить привычку
export async function deleteHabit(id: string) {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`${API_URL}/habits/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders }
  });
  if (!response.ok) throw new Error("Ошибка при удалении привычки");
  return response.json();
}

// Обновить привычку (название, цвет или массив дат)
export async function updateHabit(id: string, data: any) {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`${API_URL}/habits/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Ошибка при обновлении привычки");
  return response.json();
}

// Импорт привычек
export async function importHabitsApi(habits: Habit[]) {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`${API_URL}/habits/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders
    },
    body: JSON.stringify(habits),
  });
  if (!response.ok) throw new Error("Ошибка при импорте привычек на сервер");
  return response.json();
}