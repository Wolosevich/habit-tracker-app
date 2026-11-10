import { useState } from "react";
import {
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  ColorSwatch,
  Tooltip,
  Text,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { NewHabit } from "../types/habit";
import { HABIT_ICONS } from "../lib/icons";

const COLORS = [
  "blue",
  "teal",
  "green",
  "grape",
  "orange",
  "red",
  "pink",
  "cyan",
] as const;

interface HabitFormProps {
  initialValues?: NewHabit;
  submitLabel?: string;
  onSubmit: (habit: NewHabit) => void;
}

export function HabitForm({
  initialValues,
  submitLabel,
  onSubmit,
}: HabitFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialValues?.name || "");
  const [description, setDescription] = useState(
    initialValues?.description || "",
  );
  const [color, setColor] = useState<string>(initialValues?.color || "blue");
  const [icon, setIcon] = useState<string>(initialValues?.icon || "target");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    onSubmit({
      name: trimmedName,
      description: description.trim() || undefined,
      color,
      icon,
    });
    setName("");
    setDescription("");
    setColor("blue");
    setIcon("target");
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput
          label={t("nameLabel")}
          placeholder={t("namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
          autoFocus
        />
        <Textarea
          label={t("descriptionLabel")}
          placeholder={t("descriptionPlaceholder")}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          autosize
          minRows={2}
        />

        <Group gap="xs" align="center">
          <Text size="sm" fw={500}>
            {t("colorLabel")}
          </Text>
          {COLORS.map((c) => (
            <Tooltip key={c} label={c}>
              <ColorSwatch
                color={`var(--mantine-color-${c}-6)`}
                onClick={() => setColor(c)}
                style={{
                  cursor: "pointer",
                  outline:
                    color === c
                      ? "2px solid var(--mantine-color-dark-4)"
                      : "none",
                  outlineOffset: 2,
                }}
              />
            </Tooltip>
          ))}
        </Group>

        <Group gap="xs" align="center">
          <Text size="sm" fw={500}>
            {t("iconLabel")}
          </Text>
          {HABIT_ICONS.map((item) => (
            <Tooltip key={item.key} label={t(item.label)}>
              <Button
                variant={icon === item.key ? "filled" : "light"}
                color={icon === item.key ? color : "gray"}
                size="compact-sm"
                px={6}
                onClick={() => setIcon(item.key)}
              >
                <item.component size={18} />
              </Button>
            </Tooltip>
          ))}
        </Group>

        <Button type="submit" disabled={!name.trim()}>
          {submitLabel || t("addHabit")}
        </Button>
      </Stack>
    </form>
  );
}
