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