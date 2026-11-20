import { Container, Title, Text, SimpleGrid, Paper, Group, ThemeIcon, Stack } from '@mantine/core';
import { Heatmap } from '../components/Heatmap';
import { IconCheck, IconFlame } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useHabitsContext } from '../context/HabitsContext';
import { StatsCard } from '../components/StatsCard';
import { getMonthlyStats } from '../lib/stats';

import type { Habit } from '../types/habit'; // Убедись, что этот импорт есть

// Функция для поиска самого длинного стрика (рекорда) среди всех привычек
function calculateBestStreak(habits: Habit[]): number {
    let maxStreak = 0;

    habits.forEach((habit) => {
        if (!habit.completedDates || habit.completedDates.length === 0) return;

        // Сортируем даты от старых к новым
        const sortedDates = [...habit.completedDates].sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
        );

        let currentStreak = 0;
        let prevDate: Date | null = null;

        sortedDates.forEach((dateStr) => {
            const currentDate = new Date(dateStr);

            if (!prevDate) {
                // Первый день
                currentStreak = 1;
            } else {
                // Считаем разницу в днях
                const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    currentStreak++; // День идет подряд
                } else if (diffDays > 1) {
                    // Цепочка прервалась, проверяем, был ли это рекорд
                    if (currentStreak > maxStreak) maxStreak = currentStreak;
                    currentStreak = 1; // Начинаем новую цепочку
                }
            }
            prevDate = currentDate;
        });

        // Проверяем последнюю цепочку в цикле
        if (currentStreak > maxStreak) maxStreak = currentStreak;
    });

    return maxStreak;
}

export function StatsPage() {
    const { t } = useTranslation();
    const { habits } = useHabitsContext();

    const stats = getMonthlyStats(habits);

    // Считаем общее количество выполненных дней (по всем привычкам)
    const totalCompleted = habits.reduce((acc, habit) => acc + habit.completedDates.length, 0);
    const bestStreak = calculateBestStreak(habits);

    return (
        <Container size="sm" pt="xl" pb={100}>
            <Title order={2} mb="lg">{t('statistics')}</Title>

            <Stack gap="lg">
                {/* Круговой прогресс за месяц */}
                <StatsCard completed={stats.completed} total={stats.total} percentage={stats.percentage} />

                {/* Дополнительные виджеты */}
                <SimpleGrid cols={2} spacing="md">
                    <Paper withBorder p="md" radius="md">
                        <Group wrap="nowrap" align="flex-start">
                            <ThemeIcon color="teal" variant="light" size="lg" radius="md">
                                <IconCheck size={20} />
                            </ThemeIcon>
                            <div style={{ flex: 1 }}>
                                <Text c="dimmed" size="xs" fw={600} tt="uppercase" style={{ lineHeight: 1.2 }}>
                                    {t('totalDays')}
                                </Text>
                                <Text fw={700} size="xl" mt={4}>
                                    {totalCompleted}
                                </Text>
                            </div>
                        </Group>
                    </Paper>

                    <Paper withBorder p="md" radius="md">
                        <Group wrap="nowrap" align="flex-start">
                            <ThemeIcon color="orange" variant="light" size="lg" radius="md">
                                <IconFlame size={20} />
                            </ThemeIcon>
                            <div style={{ flex: 1 }}>
                                <Text c="dimmed" size="xs" fw={600} tt="uppercase" style={{ lineHeight: 1.2 }}>
                                    {t('bestStreak')}
                                </Text>
                                <Text fw={700} size="xl" mt={4}>
                                    {bestStreak}
                                </Text>
                            </div>
                        </Group>
                    </Paper>
                </SimpleGrid>

                {/* Карта активности за год */}
                <Paper withBorder p="md" radius="md">
                    <Text fw={600} mb="md">{t('yearActivity')}</Text>
                    <Heatmap habits={habits} />
                </Paper>

            </Stack>
        </Container>
    );
}