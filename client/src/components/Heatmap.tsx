import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Tooltip, Text, Group, ScrollArea } from '@mantine/core';
import type { Habit } from '../types/habit';

interface HeatmapProps {
    habits: Habit[];
}

// Функция для форматирования даты в YYYY-MM-DD
const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

export function Heatmap({ habits }: HeatmapProps) {
    const { t, i18n } = useTranslation();
    const { weeks, monthLabels } = useMemo(() => {
        // 1. Собираем все выполненные даты со всех привычек
        const allCompletedDates = habits.flatMap((h) => h.completedDates);

        // Считаем, сколько раз каждая дата встречается (сколько привычек выполнено в этот день)
        const dateCounts = allCompletedDates.reduce((acc, date) => {
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // 2. Генерируем сетку на 365 дней (53 недели)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 364);
        // Сдвигаем начало на понедельник, чтобы сетка была ровной
        const dayOfWeek = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1;
        startDate.setDate(startDate.getDate() - dayOfWeek);

        const weeksData: { date: Date; count: number; dateStr: string }[][] = [];
        let currentWeek: { date: Date; count: number; dateStr: string }[] = [];
        const mLabels: { month: string; index: number }[] = [];

        const currentDate = new Date(startDate);
        let weekIndex = 0;
        let lastMonth = -1;

        while (currentDate <= today) {
            const dateStr = formatDate(currentDate);
            const count = dateCounts[dateStr] || 0;

            // Запоминаем начало нового месяца для подписей
            if (currentDate.getMonth() !== lastMonth) {
                if (mLabels.length === 0 || mLabels[mLabels.length - 1].index !== weekIndex) {
                    mLabels.push({
                        month: currentDate.toLocaleString(i18n.language, { month: 'short' }),
                        index: weekIndex,
                    });
                }
                lastMonth = currentDate.getMonth();
            }

            currentWeek.push({ date: new Date(currentDate), count, dateStr });

            if (currentWeek.length === 7) {
                weeksData.push(currentWeek);
                currentWeek = [];
                weekIndex++;
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (currentWeek.length > 0) {
            weeksData.push(currentWeek);
        }

        return { weeks: weeksData, monthLabels: mLabels };
    }, [habits]);

    // Определяем цвет квадратика в зависимости от количества выполненных привычек
    const getColor = (count: number) => {
        if (count === 0) return 'var(--mantine-color-gray-2)'; // Пустой день
        if (count === 1) return 'var(--mantine-color-blue-2)';
        if (count === 2) return 'var(--mantine-color-blue-4)';
        if (count === 3) return 'var(--mantine-color-blue-6)';
        return 'var(--mantine-color-blue-8)'; // 4 и больше
    };

    return (
        <ScrollArea type="never" style={{ width: '100%' }}>
            <Box style={{ display: 'inline-block', minWidth: 'max-content' }} p="xs">
                {/* Единая сетка */}
                <Group gap={2} align="flex-start" wrap="nowrap">

                    {/* Левая колонка: Дни недели */}
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 2, width: 26 }}>
                        {/* Пустое место под названия месяцев */}
                        <Box h={16} />
                        {Array.from({ length: 7 }).map((_, i) => (
                            <Box key={i} h={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                {(i === 0 || i === 2 || i === 4) && (
                                    <Text size="10px" c="dimmed" style={{ lineHeight: 1 }}>
                                        {i === 0 ? t('dayMon') : i === 2 ? t('dayWed') : t('dayFri')}
                                    </Text>
                                )}
                            </Box>
                        ))}
                    </Box>

                    {/* Колонки с неделями */}
                    {weeks.map((week, wIndex) => {
                        const ml = monthLabels.find((m) => m.index === wIndex);

                        // Защита от наезжания месяцев: показываем, только если прошло 2+ недели
                        const prevMl = monthLabels.find((m) => m.index === wIndex - 1);
                        const showLabel = ml && (!prevMl || (ml.index - prevMl.index >= 2));

                        return (
                            <Box key={wIndex} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {/* Место под месяц */}
                                <Box h={16} style={{ position: 'relative' }}>
                                    {showLabel && (
                                        <Text
                                            size="10px"
                                            c="dimmed"
                                            style={{
                                                position: 'absolute',
                                                bottom: 4,
                                                left: 0,
                                                whiteSpace: 'nowrap',
                                                lineHeight: 1,
                                            }}
                                        >
                                            {ml.month}
                                        </Text>
                                    )}
                                </Box>

                                {/* Квадратики дней */}
                                {week.map((day, dIndex) => (
                                    <Tooltip
                                        key={dIndex}
                                        label={`${day.date.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric', year: 'numeric' })}: ${t('habitsCount', { count: day.count })}`}
                                        withArrow
                                        position="top"
                                        openDelay={100}
                                    >
                                        <Box
                                            w={12}
                                            h={12}
                                            style={{
                                                backgroundColor: getColor(day.count),
                                                borderRadius: 2,
                                                cursor: 'pointer',
                                            }}
                                        />
                                    </Tooltip>
                                ))}
                            </Box>
                        );
                    })}
                </Group>
            </Box>
        </ScrollArea>
    );
}