const API_URL = "http://localhost:3001/api";

// Функция для получения всех привычек с бэкенда
export async function fetchHabits() {
  const response = await fetch(`${API_URL}/habits`);
  if (!response.ok) {
    throw new Error("Ошибка при загрузке привычек");
  }
  return response.json();
}
