import { useState } from 'react';
import { Paper, TextInput, PasswordInput, Button, Title, Text, Tabs, Stack, Container, Center } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

export function AuthScreen() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (type: 'login' | 'register') => {
        setLoading(true);
        try {
            if (type === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                notifications.show({
                    title: t('success'),
                    message: 'Проверьте вашу почту для подтверждения (если включено в Supabase).',
                    color: 'green',
                });
            }
        } catch (err: any) {
            notifications.show({
                title: t('authError'),
                message: err.message || 'Что-то пошло не так',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size="xs" my={80}>
            <Center>
                <Paper withBorder shadow="md" p="xl" radius="md" w="100%">
                    <Title order={2} ta="center" mb="xs">{t('authTitle')}</Title>
                    <Text c="dimmed" size="sm" ta="center" mb="lg">
                        {t('authSubtitle')}
                    </Text>

                    <Tabs defaultValue="login">
                        <Tabs.List grow mb="md">
                            <Tabs.Tab value="login">{t('loginTab')}</Tabs.Tab>
                            <Tabs.Tab value="register">{t('registerTab')}</Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="login">
                            <Stack>
                                <TextInput
                                    label={t('emailLabel')}
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.currentTarget.value)}
                                    required
                                />
                                <PasswordInput
                                    label={t('passwordLabel')}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.currentTarget.value)}
                                    required
                                />
                                <Button fullWidth onClick={() => handleAuth('login')} loading={loading}>
                                    {t('loginBtn')}
                                </Button>
                            </Stack>
                        </Tabs.Panel>

                        <Tabs.Panel value="register">
                            <Stack>
                                <TextInput
                                    label={t('emailLabel')}
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.currentTarget.value)}
                                    required
                                />
                                <PasswordInput
                                    label={t('passwordLabel')}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.currentTarget.value)}
                                    required
                                />
                                <Button fullWidth onClick={() => handleAuth('register')} loading={loading} color="teal">
                                    {t('registerBtn')}
                                </Button>
                            </Stack>
                        </Tabs.Panel>
                    </Tabs>
                </Paper>
            </Center>
        </Container>
    );
}