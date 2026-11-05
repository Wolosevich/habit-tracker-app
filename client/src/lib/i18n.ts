import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ru from "../locales/ru.json";
import en from "../locales/en.json";

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
  },
  // Проверяем сохраненный язык в localStorage, иначе ставим 'ru'
  lng: localStorage.getItem("appLanguage") || "ru",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React уже защищает от XSS
  },
});

export default i18n;
