import { SimpleGrid, Box, Tooltip, Text, Stack } from "@mantine/core";
import { getCurrentMonthDays, todayKey } from "../lib/date";
import type { Habit } from "../types/habit";

const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface MonthCalendarProps {
  habit: Habit;
  onToggleDate: (id: string, date: string) => void;
}

export function MonthCalendar({ habit, onToggleDate }: MonthCalendarProps) {
  const today = todayKey();
  const days = getCurrentMonthDays();

  return (
    <Stack gap="xs">
      {/* Шапка календаря с днями недели */}
      <SimpleGrid cols={7} spacing="xs">
        {DAY_NAMES.map((day) => (
          <Text key={day} size="xs" c="dimmed" ta="center" fw={500}>
            {day}
          </Text>
        ))}
      </SimpleGrid>

      {/* Сетка с днями */}
      <SimpleGrid cols={7} spacing="xs">
        {days.map((dateKey, index) => {
          if (!dateKey) {
            // Пустая клетка в начале месяца
            return <Box key={`empty-${index}`} />;
          }

          const done = habit.completedDates.includes(dateKey);
          const isToday = dateKey === today;
          const dayNumber = parseInt(dateKey.split("-")[2], 10);

          return (
            <Tooltip key={dateKey} label={dateKey} withArrow>
              <Box
                onClick={() => onToggleDate(habit.id, dateKey)}
                style={{
                  cursor: "pointer",
                  aspectRatio: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  userSelect: "none",
                  fontWeight: 500,
                  fontSize: 14,
                  outline: "none", // Убираем рамку фокуса при клике
                  background: done
                    ? `var(--mantine-color-${habit.color}-6)`
                    : "var(--mantine-color-default)", // Mantine сам подберет правильный серый/темный цвет
                  color: done ? "white" : "inherit",
                  border: isToday
                    ? "2px solid var(--mantine-color-blue-6)"
                    : "1px solid transparent",
                  transition: "background 0.15s ease",
                }}
              >
                {dayNumber}
              </Box>
            </Tooltip>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
