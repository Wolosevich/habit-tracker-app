import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useHabits } from "../hooks/useHabits";

type HabitsContextType = ReturnType<typeof useHabits>;

const HabitsContext = createContext<HabitsContextType | null>(null);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const habitsData = useHabits();
  return (
    <HabitsContext.Provider value={habitsData}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabitsContext() {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error("useHabitsContext must be used within HabitsProvider");
  }
  return context;
}
