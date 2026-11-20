import { useState } from 'react';
import { Container, Stack, Title, Text, Button, Group, ThemeIcon, } from '@mantine/core';
import { IconTarget, IconFlame, IconBell, IconDeviceMobile, IconChevronRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface OnboardingProps {
    onComplete: () => void;
}

export function OnboardingPage({ onComplete }: OnboardingProps) {
    const { t } = useTranslation();
    const [activeSlide, setActiveSlide] = useState(0);

    // Конфигурация наших экранов
    const slides = [
        { icon: IconTarget, color: 'blue', title: 'onb1Title', desc: 'onb1Desc' },
        { icon: IconFlame, color: 'orange', title: 'onb2Title', desc: 'onb2Desc' },
        { icon: IconBell, color: 'red', title: 'onb3Title', desc: 'onb3Desc' },
        { icon: IconDeviceMobile, color: 'teal', title: 'onb4Title', desc: 'onb4Desc' },
    ];

    const current = slides[activeSlide];
    const Icon = current.icon;

    const handleNext = () => {
        if (activeSlide < slides.length - 1) {
            setActiveSlide(activeSlide + 1);
        } else {
            onComplete();
        }
    };

    return (
        <Container size="xs" h="100dvh" style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Кнопка "Пропустить" всегда справа сверху */}
            <Group justify="flex-end" pt="xl">
                <Button variant="subtle" color="gray" size="compact-sm" onClick={onComplete}>
                    {t('onbSkip')}
                </Button>
            </Group>

            {/* Основной контент по центру */}
            <Stack justify="center" align="center" style={{ flex: 1 }} gap="xl">
                <ThemeIcon size={120} radius={100} color={current.color} variant="light">
                    <Icon size={60} stroke={1.2} />
                </ThemeIcon>

                <Stack gap="sm" align="center">
                    <Title order={2} ta="center">{t(current.title)}</Title>
                    <Text c="dimmed" ta="center" size="md">{t(current.desc)}</Text>
                </Stack>
            </Stack>

            {/* Индикаторы (точки) и Кнопка "Далее" */}
            <Stack pb={50} gap="xl">
                <Group justify="center" gap="xs">
                    {slides.map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: activeSlide === i ? 24 : 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: activeSlide === i ? 'var(--mantine-color-blue-filled)' : 'var(--mantine-color-gray-3)',
                                transition: 'all 0.3s ease',
                            }}
                        />
                    ))}
                </Group>

                <Button size="md" radius="md" onClick={handleNext} rightSection={activeSlide === slides.length - 1 ? null : <IconChevronRight size={18} />}>
                    {activeSlide === slides.length - 1 ? t('onbStart') : t('onbNext')}
                </Button>
            </Stack>

        </Container>
    );
}