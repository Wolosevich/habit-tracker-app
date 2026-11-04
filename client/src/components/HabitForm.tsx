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
import type { NewHabit } from "../types/habit";

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
  submitLabel = "Добавить привычку",
  onSubmit,
}: HabitFormProps) {
  const [name, setName] = useState(initialValues?.name || "");
  const [description, setDescription] = useState(
    initialValues?.description || "",
  );
  const [color, setColor] = useState<string>(initialValues?.color || "blue");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    onSubmit({
      name: trimmedName,
      description: description.trim() || undefined,
      color,
    });

    setName("");
    setDescription("");
    setColor("blue");
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput
          label="Название"
          placeholder="Например, Читать 20 минут"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
          autoFocus
        />
        <Textarea
          label="Описание (необязательно)"
          placeholder="Зачем вам эта привычка?"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          autosize
          minRows={2}
        />
        <Group gap="xs" align="center">
          <Text size="sm" fw={500}>
            Цвет:
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
        <Button type="submit" disabled={!name.trim()}>
          {submitLabel}
        </Button>
      </Stack>
    </form>
  );
}
