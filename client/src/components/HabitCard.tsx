import {
  Card,
  Group,
  Text,
  Badge,
  ActionIcon,
  Stack,
  Box,
  Tooltip,
} from "@mantine/core";
import {
  IconCheck,
  IconTrash,
  IconFlame,
  IconPencil,
  IconCalendar,
} from "@tabler/icons-react";
import { todayKey, lastNDays, calculateStreak } from "../lib/date";
import type { Habit } from "../types/habit";

const DAY_LETTERS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

function dayLetterOf(dateKey: string): string {
  // 'T00:00:00' — чтобы дата парсилась в локальной зоне, а не UTC
  const d = new Date(`${dateKey}T00:00:00`);
  return DAY_LETTERS[d.getDay()];
}

interface HabitCardProps {
  habit: Habit;
  onToggleToday: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onShowCalendar: (habit: Habit) => void;
}

export function HabitCard({
  habit,
  onToggleToday,
  onRemove,
  onEdit,
  onShowCalendar,
}: HabitCardProps) {
  const today = todayKey();
  const doneToday = habit.completedDates.includes(today);
  const week = lastNDays(7);
  const streak = calculateStreak(habit.completedDates);

  return (
    <Card withBorder shadow="sm" radius="md" padding="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={4} style={{ flex: 1 }}>
          <Text fw={600}>{habit.name}</Text>
          {habit.description && (
            <Text size="sm" c="dimmed">
              {habit.description}
            </Text>
          )}

          <Group gap="xs" mt="xs">
            <Badge color={habit.color} variant={doneToday ? "filled" : "light"}>
              {doneToday ? "Сегодня готово" : "Не отмечено"}
            </Badge>
            <Badge variant="default">
              Всего: {habit.completedDates.length} дн.
            </Badge>
            {/* НОВЫЙ БЕЙДЖ */}
            {streak > 0 && (
              <Badge
                variant="light"
                color="orange"
                leftSection={<IconFlame size={12} />}
              >
                {streak} дн. подряд
              </Badge>
            )}
          </Group>

          <Group gap={6} mt="md">
            {week.map((dateKey) => {
              const done = habit.completedDates.includes(dateKey);
              const isToday = dateKey === today;
              return (
                <Stack key={dateKey} gap={2} align="center">
                  <Text size="xs" c="dimmed">
                    {dayLetterOf(dateKey)}
                  </Text>
                  <Tooltip label={dateKey} withArrow>
                    <Box
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 4,
                        background: done
                          ? `var(--mantine-color-${habit.color}-6)`
                          : "var(--mantine-color-gray-2)",
                        outline: isToday
                          ? "2px solid var(--mantine-color-dark-4)"
                          : "none",
                        outlineOffset: 1,
                      }}
                    />
                  </Tooltip>
                </Stack>
              );
            })}
          </Group>
        </Stack>

        <Group gap="xs" wrap="nowrap">
          <ActionIcon
            color={doneToday ? habit.color : "gray"}
            variant={doneToday ? "filled" : "light"}
            size="lg"
            radius="xl"
            onClick={() => onToggleToday(habit.id)}
            aria-label={doneToday ? "Отменить отметку" : "Отметить выполнение"}
          >
            <IconCheck size={18} />
          </ActionIcon>

          <ActionIcon
            color="teal"
            variant="subtle"
            size="lg"
            onClick={() => onShowCalendar(habit)}
            aria-label="Календарь привычки"
          >
            <IconCalendar size={18} />
          </ActionIcon>

          {/* НОВАЯ КНОПКА */}
          <ActionIcon
            color="blue"
            variant="subtle"
            size="lg"
            onClick={() => onEdit(habit)}
            aria-label="Редактировать привычку"
          >
            <IconPencil size={18} />
          </ActionIcon>
          <ActionIcon
            color="red"
            variant="subtle"
            size="lg"
            onClick={() => onRemove(habit.id)}
            aria-label="Удалить привычку"
          >
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  );
}
