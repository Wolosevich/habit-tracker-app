export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  createdAt: string;
  completedDates: string[];
}

export type NewHabit = Pick<Habit, "name" | "description" | "color" | "icon">;
