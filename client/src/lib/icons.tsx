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
  { key: "target", component: IconTarget, label: "icon_target" },
  { key: "book", component: IconBook, label: "icon_book" },
  { key: "run", component: IconRun, label: "icon_run" },
  { key: "code", component: IconCode, label: "icon_code" },
  { key: "water", component: IconDroplet, label: "icon_water" },
  { key: "sleep", component: IconBed, label: "icon_sleep" },
  { key: "food", component: IconApple, label: "icon_food" },
  { key: "yoga", component: IconYoga, label: "icon_yoga" },
  { key: "art", component: IconBrush, label: "icon_art" },
  { key: "music", component: IconMusic, label: "icon_music" },
];

export function getIconComponent(key: string) {
  return HABIT_ICONS.find((i) => i.key === key)?.component || IconTarget;
}
