import { useState, useEffect } from "react";
import { HabitsProvider, useHabitsContext } from "./context/HabitsContext";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from 'framer-motion';
import { PageTransition } from './components/PageTransition';
import { SettingsPage } from "./pages/SettingsPage";
import { StatsPage } from './pages/StatsPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { BottomNav } from './components/BottomNav';
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import { AuthScreen } from "./components/AuthScreen";
import "@mantine/core/styles.css";
import {
  MantineProvider,
  createTheme,
  Title,
  Text,
  Container,
  Stack,
  Paper,
  Divider,
  Modal,
  Button,
  Group,
  ActionIcon,
  Tooltip,
  useMantineColorScheme,
  useComputedColorScheme,
  Loader,
  Center,
} from "@mantine/core";
import {
  IconSun,
  IconMoon,
  IconSettings,
  IconLogout,
} from "@tabler/icons-react";
import { useTranslation, Trans } from "react-i18next";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import { Notifications } from "@mantine/notifications";
import { HabitForm } from "./components/HabitForm";
import { HabitCard } from "./components/HabitCard";
import { MonthCalendar } from "./components/MonthCalendar";
import type { Habit, NewHabit } from "./types/habit";

const theme = createTheme({
  colors: {
    dark: [
      "#f5f5f5",
      "#e0e0e0",
      "#c2c2c2",
      "#a3a3a3",
      "#858585",
      "#708499",
      "#232e3c",
      "#17212b",
      "#0e1621",
      "#080c11",
    ],
  },
  primaryColor: "blue",
});

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><AppContent /></PageTransition>} />
        <Route path="/stats" element={<PageTransition><StatsPage /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    // Проверяем сессию при загрузке
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });
    // Подписываемся на изменения (вход/выход)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      const seen = localStorage.getItem(`hasSeenOnboarding_${session.user.id}`) === 'true';
      setHasSeenOnboarding(seen);
    } else {
      setHasSeenOnboarding(false);
    }
  }, [session]);

  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Notifications position="top-right" />
      <BrowserRouter>
        {isLoading ? (
          <Center h="100vh"><Loader /></Center>
        ) : !session ? (
          <AuthScreen />
        ) : !hasSeenOnboarding ? (
          <OnboardingPage
            onComplete={() => {
              if (session?.user?.id) {
                localStorage.setItem(`hasSeenOnboarding_${session.user.id}`, 'true');
              }
              setHasSeenOnboarding(true);
            }}
          />
        ) : (
          <HabitsProvider>
            <AnimatedRoutes />
            <BottomNav />
          </HabitsProvider>
        )}
      </BrowserRouter>
    </MantineProvider>
  );
}

function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  return (
    <Tooltip label="Тема / Theme">
      <ActionIcon
        variant="default"
        size="lg"
        aria-label="Toggle color scheme"
        onClick={() =>
          setColorScheme(computedColorScheme === "light" ? "dark" : "light")
        }
      >
        {computedColorScheme === "light" ? (
          <IconMoon size={20} stroke={1.5} />
        ) : (
          <IconSun size={20} stroke={1.5} />
        )}
      </ActionIcon>
    </Tooltip>
  );
}

function LanguageToggle() {
  const { i18n } = useTranslation();
  const isRu = i18n.language === "ru";

  const toggleLanguage = () => {
    const newLang = isRu ? "en" : "ru";
    i18n.changeLanguage(newLang);
    localStorage.setItem("appLanguage", newLang);
  };

  return (
    <Button
      variant="default"
      size="compact-md"
      onClick={toggleLanguage}
      px="xs"
      fw={600}
    >
      {isRu ? "EN" : "RU"}
    </Button>
  );
}

function AppContent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    habits,
    loading,
    addHabit,
    removeHabit,
    toggleToday,
    toggleDate,
    updateHabit,
    //importHabits,
  } = useHabitsContext();

  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);
  const [calendarHabitId, setCalendarHabitId] = useState<string | null>(null);
  const calendarHabit = habits.find((h) => h.id === calendarHabitId) || null;

  const handleUpdate = (data: NewHabit) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, data);
      setEditingHabit(null);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingHabit) {
      removeHabit(deletingHabit.id);
      setDeletingHabit(null);
    }
  };

  return (
    <Container size="sm" py="xl" pb={100}>
      <Group justify="space-between" align="flex-end" mt="sm" mb="lg">
        <div>
          <Title order={1}>{t("appTitle")}</Title>
          <Text c="dimmed" mt="sm">
            {t("appSubtitle")}
          </Text>
        </div>

        <Group gap="xs">
          <LanguageToggle />
          <ThemeToggle />

          <Tooltip label={t("settings")}>
            <ActionIcon
              variant="light"
              color="blue"
              size="lg"
              aria-label={t("settings")}
              onClick={() => navigate("/settings")}
              visibleFrom="sm"
            >
              <IconSettings size={20} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={t("logout")}>
            <ActionIcon
              variant="light"
              color="red"
              size="lg"
              onClick={() => supabase.auth.signOut()}
            >
              <IconLogout size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <Paper withBorder p="md" mt="lg" radius="md">
        <HabitForm onSubmit={addHabit} />
      </Paper>

      <Divider my="xl" />



      <Stack>
        {loading ? (
          <Center py="xl">
            <Loader color="blue" />
          </Center>
        ) : habits.length === 0 ? (
          <Text c="dimmed" ta="center">
            {t("emptyState")}
          </Text>
        ) : (
          habits.map((habit, index) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <HabitCard
                habit={habit}
                onToggleToday={toggleToday}
                onEdit={setEditingHabit}
                onRemove={() => setDeletingHabit(habit)}
                onShowCalendar={(habit) => setCalendarHabitId(habit.id)}
              />
            </motion.div>
          ))
        )}
      </Stack>

      <Modal
        opened={!!editingHabit}
        onClose={() => setEditingHabit(null)}
        title={t("editHabit")}
      >
        {editingHabit && (
          <HabitForm
            initialValues={editingHabit}
            submitLabel={t("saveChanges")}
            onSubmit={handleUpdate}
          />
        )}
      </Modal>

      <Modal
        opened={!!deletingHabit}
        onClose={() => setDeletingHabit(null)}
        title={t("deleteHabit")}
        size="sm"
      >
        <Text mb="lg">
          <Trans
            i18nKey="deleteConfirm"
            values={{ name: deletingHabit?.name }}
            components={{ b: <b /> }}
          />
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDeletingHabit(null)}>
            {t("cancel")}
          </Button>
          <Button color="red" onClick={handleConfirmDelete}>
            {t("delete")}
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={!!calendarHabitId}
        onClose={() => setCalendarHabitId(null)}
        title={t("calendar", { name: calendarHabit?.name || "" })}
        size="md"
      >
        {calendarHabit && (
          <MonthCalendar habit={calendarHabit} onToggleDate={toggleDate} />
        )}
      </Modal>
    </Container>
  );
}
