import { useCallback, useEffect, useState } from "react";
import type { Habit, NewHabit } from "../types/habit";
import { loadHabits, saveHabits } from "../lib/storage";
import { todayKey } from "../lib/date";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());

  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  const addHabit = useCallback((data: NewHabit): Habit => {
    const habit: Habit = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      completedDates: [],
      ...data,
    };
    setHabits((prev) => [...prev, habit]);
    return habit;
  }, []);

  const removeHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const updateHabit = useCallback((id: string, data: NewHabit) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...data } : h)));
  }, []);

  const toggleToday = useCallback((id: string) => {
    const today = todayKey();
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const done = h.completedDates.includes(today);
        return {
          ...h,
          completedDates: done
            ? h.completedDates.filter((d) => d !== today)
            : [...h.completedDates, today],
        };
      }),
    );
  }, []);

  const toggleDate = useCallback((id: string, date: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const done = h.completedDates.includes(date);
        return {
          ...h,
          completedDates: done
            ? h.completedDates.filter((d) => d !== date)
            : [...h.completedDates, date],
        };
      }),
    );
  }, []);

  const importHabits = useCallback((imported: Habit[]) => {
    // Простая защита: заменяем текущие данные на импортированные
    setHabits(imported);
  }, []);

  return {
    habits,
    addHabit,
    removeHabit,
    toggleToday,
    updateHabit,
    importHabits,
    toggleDate,
  };
}
