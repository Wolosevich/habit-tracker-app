const API_URL = "http://localhost:3001/api";

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
