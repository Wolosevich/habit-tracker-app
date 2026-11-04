import { useCallback, useEffect, useState } from "react";
import type { Habit, NewHabit } from "../types/habit";
import * as api from "../lib/api";
import { todayKey } from "../lib/date";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  // При монтировании компонента загружаем данные с бэкенда
  useEffect(() => {
    api
      .fetchHabits()
      .then((data) => setHabits(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const addHabit = useCallback(async (data: NewHabit) => {
    try {
      const newHabit = await api.createHabit(data);
      setHabits((prev) => [...prev, newHabit]);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const removeHabit = useCallback(async (id: string) => {
    try {
      await api.deleteHabit(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const updateHabit = useCallback(async (id: string, data: NewHabit) => {
    try {
      const updated = await api.updateHabit(id, data);
      setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const toggleDate = useCallback(
    async (id: string, date: string) => {
      const habit = habits.find((h) => h.id === id);
      if (!habit) return;

      const done = habit.completedDates.includes(date);
      const newDates = done
        ? habit.completedDates.filter((d) => d !== date)
        : [...habit.completedDates, date];

      try {
        const updated = await api.updateHabit(id, { completedDates: newDates });
        setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
      } catch (err) {
        console.error(err);
      }
    },
    [habits],
  ); // Зависимость от habits, так как мы ищем в них привычку

  const toggleToday = useCallback(
    (id: string) => {
      toggleDate(id, todayKey());
    },
    [toggleDate],
  );

  const importHabits = useCallback((imported: Habit[]) => {
    // Временная заглушка, так как импорт JSON мы переделаем позже под базу данных
    setHabits(imported);
  }, []);

  return {
    habits,
    loading,
    addHabit,
    removeHabit,
    toggleDate,
    toggleToday,
    updateHabit,
    importHabits,
  };
}
