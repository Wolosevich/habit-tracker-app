import type { Habit } from "../types/habit";

const STORAGE_KEY = "habit-tracker:habits";

export function loadHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Habit[];
  } catch (err) {
    console.warn("Не удалось прочитать привычки из localStorage", err);
    return [];
  }
}

export function saveHabits(habits: Habit[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  } catch (err) {
    console.warn("Не удалось сохранить привычки в localStorage", err);
  }
}
