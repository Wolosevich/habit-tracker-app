import {
  IconTarget,
  IconBook,
  IconRun,
  IconCode,
  IconDroplet,
  IconBed,
  IconApple,
  IconYoga,
  IconBrush,
  IconMusic,
} from "@tabler/icons-react";

export const HABIT_ICONS = [
  { key: "target", component: IconTarget, label: "Цель" },
  { key: "book", component: IconBook, label: "Книга" },
  { key: "run", component: IconRun, label: "Спорт" },
  { key: "code", component: IconCode, label: "Код" },
  { key: "water", component: IconDroplet, label: "Вода" },
  { key: "sleep", component: IconBed, label: "Сон" },
  { key: "food", component: IconApple, label: "Еда" },
  { key: "yoga", component: IconYoga, label: "Йога" },
  { key: "art", component: IconBrush, label: "Творчество" },
  { key: "music", component: IconMusic, label: "Музыка" },
];

export function getIconComponent(key: string) {
  return HABIT_ICONS.find((i) => i.key === key)?.component || IconTarget;
}
