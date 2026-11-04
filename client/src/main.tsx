import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// Делаем фон body адаптивным к теме Mantine
document.body.style.backgroundColor = "var(--mantine-color-body)";
document.body.style.margin = "0";
document.body.style.minHeight = "100vh";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
