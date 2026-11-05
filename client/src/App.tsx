import { useState, useRef } from "react";
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
  IconDownload,
  IconUpload,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { useTranslation, Trans } from "react-i18next";
import { downloadHabits, readHabitsFromFile } from "./lib/backup";
import { useHabits } from "./hooks/useHabits";
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

export default function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <AppContent />
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

// 👇 НОВЫЙ КОМПОНЕНТ ДЛЯ ПЕРЕКЛЮЧЕНИЯ ЯЗЫКА 👇
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
  const { t } = useTranslation(); // 👈 Подключаем функцию перевода
  const {
    habits,
    loading,
    addHabit,
    removeHabit,
    toggleToday,
    toggleDate,
    updateHabit,
    importHabits,
  } = useHabits();

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imported = await readHabitsFromFile(file);
      importHabits(imported);
      alert("Данные успешно загружены! / Data loaded successfully!");
    } catch (err) {
      alert((err as Error).message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Container size="sm" py="xl">
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
          <Button
            variant="light"
            size="xs"
            leftSection={<IconDownload size={16} />}
            onClick={() => downloadHabits(habits)}
          >
            {t("export")}
          </Button>
          <Button
            variant="light"
            size="xs"
            leftSection={<IconUpload size={16} />}
            onClick={() => fileInputRef.current?.click()}
          >
            {t("import")}
          </Button>
          <input
            type="file"
            accept=".json,application/json"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImport}
          />
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
          habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggleToday={toggleToday}
              onEdit={setEditingHabit}
              onRemove={() => setDeletingHabit(habit)}
              onShowCalendar={(habit) => setCalendarHabitId(habit.id)}
            />
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
          {/* Используем Trans, так как внутри перевода есть тег <b> */}
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
