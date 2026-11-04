import { useState, useRef, useEffect } from "react";
import { fetchHabits } from "./lib/api";
import { MonthCalendar } from "./components/MonthCalendar";
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
import { downloadHabits, readHabitsFromFile } from "./lib/backup";
import { useHabits } from "./hooks/useHabits";
import { HabitForm } from "./components/HabitForm";
import { HabitCard } from "./components/HabitCard";
import type { Habit, NewHabit } from "./types/habit";

const theme = createTheme({
  colors: {
    // Переопределяем стандартную тёмную палитру Mantine на цвета Telegram
    dark: [
      "#f5f5f5", // 0 - основной текст
      "#e0e0e0", // 1
      "#c2c2c2", // 2
      "#a3a3a3", // 3 - текст с c="dimmed" (приглушенный)
      "#858585", // 4
      "#708499", // 5 - текст в placeholder
      "#232e3c", // 6 - фон карточек (Paper, Card) и инпутов
      "#17212b", // 7 - ОСНОВНОЙ ФОН страницы (как в Telegram)
      "#0e1621", // 8 - более темный фон (тени, разделители)
      "#080c11", // 9
    ],
  },
  primaryColor: "blue", // Оставляем синий для акцентов (кнопок, галочек)
});

export default function App() {
  return (
    // defaultColorScheme="auto" позволяет при первом запуске
    // подхватить тему из настроек операционной системы пользователя
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <AppContent />
    </MantineProvider>
  );
}

// Выносим кнопку переключения темы в отдельный маленький компонент
function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  // useComputedColorScheme нужен, чтобы понять, какая тема сейчас реально активна
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  return (
    <Tooltip label="Переключить тему">
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

function AppContent() {
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

  // ВРЕМЕННЫЙ ЭФФЕКТ ДЛЯ ПРОВЕРКИ СВЯЗИ С БЭКЕНДОМ
  useEffect(() => {
    fetchHabits()
      .then((data) => {
        console.log("Успех! Данные с бэкенда:", data);
      })
      .catch((err) => {
        console.error("Ошибка связи с бэкендом:", err);
      });
  }, []);

  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);
  const [calendarHabitId, setCalendarHabitId] = useState<string | null>(null);

  // Всегда находим актуальную привычку по ID из свежего списка habits
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
      alert("Данные успешно загружены!");
    } catch (err) {
      alert((err as Error).message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Container size="sm" py="xl">
      {/* Шапка */}
      <Group justify="space-between" align="flex-end" mt="sm" mb="lg">
        <div>
          <Title order={1}>Трекер привычек</Title>
          <Text c="dimmed" mt="sm">
            Отслеживайте свои ежедневные привычки.
          </Text>
        </div>

        <Group gap="xs">
          <ThemeToggle />
          <Button
            variant="light"
            size="xs"
            leftSection={<IconDownload size={16} />}
            onClick={() => downloadHabits(habits)}
          >
            Экспорт
          </Button>
          <Button
            variant="light"
            size="xs"
            leftSection={<IconUpload size={16} />}
            onClick={() => fileInputRef.current?.click()}
          >
            Импорт
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
            Пока нет привычек. Добавьте первую!
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
        title="Редактировать привычку"
      >
        {editingHabit && (
          <HabitForm
            initialValues={editingHabit}
            submitLabel="Сохранить изменения"
            onSubmit={handleUpdate}
          />
        )}
      </Modal>

      <Modal
        opened={!!deletingHabit}
        onClose={() => setDeletingHabit(null)}
        title="Удалить привычку?"
        size="sm"
      >
        <Text mb="lg">
          Вы уверены, что хотите удалить <b>{deletingHabit?.name}</b>? Вся
          история отметок будет потеряна.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDeletingHabit(null)}>
            Отмена
          </Button>
          <Button color="red" onClick={handleConfirmDelete}>
            Удалить
          </Button>
        </Group>
      </Modal>
      {/* Модалка календаря */}
      <Modal
        opened={!!calendarHabitId}
        onClose={() => setCalendarHabitId(null)}
        title={`Календарь: ${calendarHabit?.name || ""}`}
        size="md"
      >
        {calendarHabit && (
          <MonthCalendar habit={calendarHabit} onToggleDate={toggleDate} />
        )}
      </Modal>
    </Container>
  );
}
