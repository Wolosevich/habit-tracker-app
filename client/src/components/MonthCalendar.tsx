import { SimpleGrid, Box, Tooltip, Text, Stack } from "@mantine/core";
import { useTranslation } from "react-i18next"; // 👈 Подключаем перевод
import { getCurrentMonthDays, todayKey } from "../lib/date";
import type { Habit } from "../types/habit";

interface MonthCalendarProps {
  habit: Habit;
  onToggleDate: (id: string, date: string) => void;
}

export function MonthCalendar({ habit, onToggleDate }: MonthCalendarProps) {
  const { i18n } = useTranslation(); // 👈 Получаем текущий язык
  const today = todayKey();
  const days = getCurrentMonthDays();

  // 👇 Генерируем названия дней недели на нужном языке 👇
  const getWeekdayHeaders = () => {
    const monday = new Date("2024-01-01T00:00:00"); // Берем за основу понедельник
    const headers = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      headers.push(
        new Intl.DateTimeFormat(i18n.language, { weekday: "short" }).format(
          date,
        ),
      );
    }
    return headers;
  };

  const dayHeaders = getWeekdayHeaders();

  return (
    <Stack gap="xs">
      {/* Шапка календаря с днями недели */}
      <SimpleGrid cols={7} spacing="xs">
        {dayHeaders.map((day) => (
          <Text key={day} size="xs" c="dimmed" ta="center" fw={500}>
            {day}
          </Text>
        ))}
      </SimpleGrid>

      {/* Сетка с днями */}
      <SimpleGrid cols={7} spacing="xs">
        {days.map((dateKey, index) => {
          if (!dateKey) {
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
                  outline: "none",
                  background: done
                    ? `var(--mantine-color-${habit.color}-6)`
                    : "var(--mantine-color-default)",
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
