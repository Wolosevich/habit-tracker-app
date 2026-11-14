import { Paper, Group, RingProgress, Text, Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface StatsCardProps {
  completed: number;
  total: number;
  percentage: number;
}

export function StatsCard({ completed, total, percentage }: StatsCardProps) {
  const { t } = useTranslation();

  // Выбираем цвет для кольца в зависимости от прогресса
  const color = percentage < 30 ? "red" : percentage < 70 ? "orange" : "teal";

  return (
    <Paper withBorder p="md" radius="md" mb="xl" shadow="sm">
      <Group>
        <RingProgress
          size={90}
          roundCaps
          thickness={8}
          sections={[{ value: percentage, color }]}
          label={
            <Text size="md" ta="center" fw={700}>
              {percentage}%
            </Text>
          }
        />
        <Stack gap={0}>
          <Text size="lg" fw={600}>
            {t("monthlyProgress")}
          </Text>
          <Text size="sm" c="dimmed">
            {t("completedOfTotal", { completed, total })}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
}
