import { Container, Title, Text, SimpleGrid, Paper, Group, ThemeIcon, Stack } from '@mantine/core';
import { IconCheck, IconFlame } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useHabitsContext } from '../context/HabitsContext';
import { StatsCard } from '../components/StatsCard';
import { getMonthlyStats } from '../lib/stats';

export function StatsPage() {
    const { t } = useTranslation();
    const { habits } = useHabitsContext();

    const stats = getMonthlyStats(habits);

    // Считаем общее количество выполненных дней (по всем привычкам)
    const totalCompleted = habits.reduce((acc, habit) => acc + habit.completedDates.length, 0);

    return (
        <Container size="sm" pt="xl" pb={100}>
            <Title order={2} mb="lg">{t('statistics')}</Title>

            <Stack gap="lg">
                {/* Круговой прогресс за месяц */}
                <StatsCard completed={stats.completed} total={stats.total} percentage={stats.percentage} />

                {/* Дополнительные виджеты */}
                <SimpleGrid cols={2}>
                    <Paper withBorder p="md" radius="md">
                        <Group>
                            <ThemeIcon color="teal" variant="light" size="lg" radius="md">
                                <IconCheck size={20} />
                            </ThemeIcon>
                            <div>
                                <Text c="dimmed" size="xs" fw={700} tt="uppercase">{t('totalDays')}</Text>
                                <Text fw={700} size="xl">{totalCompleted}</Text>
                            </div>
                        </Group>
                    </Paper>

                    <Paper withBorder p="md" radius="md">
                        <Group>
                            <ThemeIcon color="orange" variant="light" size="lg" radius="md">
                                <IconFlame size={20} />
                            </ThemeIcon>
                            <div>
                                <Text c="dimmed" size="xs" fw={700} tt="uppercase">{t('bestStreak')}</Text>
                                <Text fw={700} size="xl">
                                    {/* Пока просто заглушка, расчет стриков добавим позже, если нужно */}
                                    0
                                </Text>
                            </div>
                        </Group>
                    </Paper>
                </SimpleGrid>
            </Stack>
        </Container>
    );
}