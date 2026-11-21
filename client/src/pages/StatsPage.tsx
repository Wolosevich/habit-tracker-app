import { Container, Title, Text, SimpleGrid, Paper, Group, ThemeIcon, Stack, Button } from '@mantine/core';
import { Heatmap } from '../components/Heatmap';
import { IconCheck, IconFlame, IconChartPie } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useHabitsContext } from '../context/HabitsContext';
import { StatsCard } from '../components/StatsCard';
import { getMonthlyStats } from '../lib/stats';
import type { Habit } from '../types/habit';
import { useNavigate } from 'react-router-dom';

// Функция для поиска самого длинного стрика (рекорда) среди всех привычек
function calculateBestStreak(habits: Habit[]): number {
    let maxStreak = 0;

    habits.forEach((habit) => {
        if (!habit.completedDates || habit.completedDates.length === 0) return;

        const sortedDates = [...habit.completedDates].sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
        );

        let currentStreak = 0;
        let prevDate: Date | null = null;

        sortedDates.forEach((dateStr) => {
            const currentDate = new Date(dateStr);

            if (!prevDate) {
                currentStreak = 1;
            } else {
                const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    currentStreak++;
                } else if (diffDays > 1) {
                    if (currentStreak > maxStreak) maxStreak = currentStreak;
                    currentStreak = 1;
                }
            }
            prevDate = currentDate;
        });

        if (currentStreak > maxStreak) maxStreak = currentStreak;
    });

    return maxStreak;
}

export function StatsPage() {
    const { t } = useTranslation();
    const { habits } = useHabitsContext();
    const navigate = useNavigate(); // ✅ Хук теперь внутри компонента!

    const stats = getMonthlyStats(habits);
    const isEmpty = habits.length === 0;

    const totalCompleted = habits.reduce((acc, habit) => acc + habit.completedDates.length, 0);
    const bestStreak = calculateBestStreak(habits);

    return (
        <Container size="sm" pt="xl" pb={100}>
            <Title order={2} mb="lg">{t('statistics')}</Title>

            <Stack gap="lg">
                {isEmpty ? (
                    <Paper withBorder p="xl" radius="md" ta="center">
                        <ThemeIcon size={60} radius="100" color="gray" variant="light" mx="auto" mb="md">
                            <IconChartPie size={30} />
                        </ThemeIcon>
                        <Text fw={500} size="lg" mb="xs">{t('noStatsYet')}</Text>
                        <Text c="dimmed" size="sm" mb="md">{t('noStatsDesc')}</Text>
                        <Button onClick={() => navigate('/')} variant="light">
                            {t('goToHabits')}
                        </Button>
                    </Paper>
                ) : (
                    <>
                        <StatsCard completed={stats.completed} total={stats.total} percentage={stats.percentage} />

                        {/* ✅ Вернули карточки на место */}
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

                        <Paper withBorder p="md" radius="md">
                            <Text fw={600} mb="md">{t('yearActivity')}</Text>
                            <Heatmap habits={habits} />
                        </Paper>
                    </>
                )}
            </Stack>
        </Container>
    );
}