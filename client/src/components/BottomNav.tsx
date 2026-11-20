import { Paper, Group, UnstyledButton, Text, Center } from '@mantine/core';
import { IconChecklist, IconSettings, IconChartPie } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const isHabits = location.pathname === '/';
    const isSettings = location.pathname === '/settings';
    const isStats = location.pathname === '/stats';

    return (
        <Paper
            shadow="md"
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                borderTop: '1px solid var(--mantine-color-default-border)',
                // Учитываем безопасную зону снизу (для iPhone с FaceID и жестов Android)
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
                paddingTop: '8px',
            }}
            hiddenFrom="sm" // Скрываем на десктопе (экраны от 768px)
        >
            <Group grow gap={0}>
                <UnstyledButton onClick={() => navigate('/')} py="xs">
                    <Center>
                        <IconChecklist
                            size={24}
                            stroke={isHabits ? 2 : 1.5}
                            color={isHabits ? 'var(--mantine-color-blue-filled)' : 'var(--mantine-color-dimmed)'}
                        />
                    </Center>
                    <Text size="xs" ta="center" c={isHabits ? 'blue' : 'dimmed'} mt={4} fw={isHabits ? 600 : 400}>
                        {t('habits')}
                    </Text>
                </UnstyledButton>

                <UnstyledButton onClick={() => navigate('/stats')} py="xs">
                    <Center>
                        <IconChartPie
                            size={24}
                            stroke={isStats ? 2 : 1.5}
                            color={isStats ? 'var(--mantine-color-blue-filled)' : 'var(--mantine-color-dimmed)'}
                        />
                    </Center>
                    <Text size="xs" ta="center" c={isStats ? 'blue' : 'dimmed'} mt={4} fw={isStats ? 600 : 400}>
                        {t('statistics')}
                    </Text>
                </UnstyledButton>

                <UnstyledButton onClick={() => navigate('/settings')} py="xs">
                    <Center>
                        <IconSettings
                            size={24}
                            stroke={isSettings ? 2 : 1.5}
                            color={isSettings ? 'var(--mantine-color-blue-filled)' : 'var(--mantine-color-dimmed)'}
                        />
                    </Center>
                    <Text size="xs" ta="center" c={isSettings ? 'blue' : 'dimmed'} mt={4} fw={isSettings ? 600 : 400}>
                        {t('settings')}
                    </Text>
                </UnstyledButton>
            </Group>
        </Paper>
    );
}