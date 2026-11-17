import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Group,
  Title,
  ActionIcon,
  Stack,
  Text,
  Paper,
  Divider,
  SegmentedControl,
  useMantineColorScheme,
  Switch,
  Button,
  Loader,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconClock,
  IconDownload,
  IconUpload,
} from "@tabler/icons-react";
import { TimeInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { downloadHabits, readHabitsFromFile } from "../lib/backup";
import { useHabitsContext } from "../context/HabitsContext";
import {
  subscribeToPush,
  unsubscribeFromPush,
  checkSubscription,
  updateNotificationTime,
  getNotificationTime,
} from "../lib/push";

export function SettingsPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const { habits, importHabits } = useHabitsContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Состояния для темы и языка ---
  const currentLang = i18n.language.startsWith("ru") ? "ru" : "en";
  const handleLanguageChange = (val: string) => {
    i18n.changeLanguage(val);
    localStorage.setItem("appLanguage", val);
  };

  // --- Состояния для уведомлений ---
  const [notifTime, setNotifTime] = useState(() => {
    return localStorage.getItem("notificationTime") || "20:00";
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSavingTime, setIsSavingTime] = useState(false);
  const [isLoadingNotif, setIsLoadingNotif] = useState(true);

  useEffect(() => {
    checkSubscription()
      .then((subbed) => {
        setIsSubscribed(subbed);
        if (subbed) {
          return getNotificationTime();
        }
      })
      .then((time) => {
        if (time) {
          setNotifTime(time);
          localStorage.setItem("notificationTime", time);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingNotif(false));
  }, []);

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      await unsubscribeFromPush();
      setIsSubscribed(false);
    } else {
      await subscribeToPush();
      setIsSubscribed(true);
    }
  };

  const handleSaveTime = async () => {
    setIsSavingTime(true);
    try {
      await updateNotificationTime(notifTime);
      localStorage.setItem("notificationTime", notifTime);
      notifications.show({
        title: t("success"),
        message: t("timeSaved"),
        color: "green",
      });
    } catch (err) {
      notifications.show({
        title: t("error"),
        message: (err as Error).message,
        color: "red",
      });
    } finally {
      setIsSavingTime(false);
    }
  };
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = await readHabitsFromFile(file);
      await importHabits(imported);
      notifications.show({
        title: t("success"),
        message: t("importSuccess"),
        color: "green",
      });
    } catch (err) {
      notifications.show({
        title: t("error"),
        message: (err as Error).message,
        color: "red",
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isLoadingNotif) {
    return (
      <Container size="sm" py="xl">
        <Group mb="lg" gap="sm">
          <ActionIcon variant="default" size="lg" onClick={() => navigate("/")}>
            <IconArrowLeft size={20} stroke={1.5} />
          </ActionIcon>
          <Title order={2}>{t("settings")}</Title>
        </Group>
        <Loader color="blue" />
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Group mb="lg" gap="sm">
        <ActionIcon
          variant="default"
          size="lg"
          aria-label="Back"
          onClick={() => navigate("/")}
        >
          <IconArrowLeft size={20} stroke={1.5} />
        </ActionIcon>
        <Title order={2}>{t("settings")}</Title>
      </Group>

      <Stack gap="lg">
        {/* Блок 1: Внешний вид (Тема) */}
        <Paper withBorder p="md" radius="md">
          <Text fw={500} mb="sm">
            {t("appearance")}
          </Text>
          <SegmentedControl
            fullWidth
            value={colorScheme}
            onChange={(value) =>
              setColorScheme(value as "light" | "dark" | "auto")
            }
            data={[
              { label: t("themeLight"), value: "light" },
              { label: t("themeDark"), value: "dark" },
              { label: t("themeAuto"), value: "auto" },
            ]}
          />
        </Paper>

        {/* Блок 2: Язык */}
        <Paper withBorder p="md" radius="md">
          <Text fw={500} mb="sm">
            {t("language")}
          </Text>
          <SegmentedControl
            fullWidth
            value={currentLang}
            onChange={handleLanguageChange}
            data={[
              { label: "Русский", value: "ru" },
              { label: "English", value: "en" },
            ]}
          />
        </Paper>

        {/* Блок 3: Уведомления */}
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" mb={isSubscribed ? "md" : 0}>
            <Text fw={500}>{t("notifications")}</Text>
            <Switch
              checked={isSubscribed}
              onChange={handleToggleNotifications}
              color="blue"
            />
          </Group>

          {isSubscribed && (
            <Stack gap="sm">
              <TimeInput
                label={t("notifTime")}
                value={notifTime}
                onChange={(event) => setNotifTime(event.currentTarget.value)}
                leftSection={<IconClock size={16} />}
              />
              <Button
                variant="light"
                loading={isSavingTime}
                onClick={handleSaveTime}
              >
                {t("saveTime")}
              </Button>
            </Stack>
          )}
        </Paper>
        {/* Блок 4: Данные */}
        <Paper withBorder p="md" radius="md">
          <Text fw={500} mb="sm">
            {t("data")}
          </Text>
          <Group grow>
            <Button
              variant="light"
              leftSection={<IconDownload size={16} />}
              onClick={() => downloadHabits(habits)}
            >
              {t("export")}
            </Button>
            <Button
              variant="light"
              leftSection={<IconUpload size={16} />}
              onClick={() => fileInputRef.current?.click()}
            >
              {t("import")}
            </Button>
          </Group>
          <input
            type="file"
            accept=".json,application/json"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImport}
          />
        </Paper>

        <Divider />

        <Text size="xs" c="dimmed" ta="center">
          v0.1.0
        </Text>
      </Stack>
    </Container>
  );
}
