/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:8000",
          changeOrigin: true,
        },
      },
    },
    // Pruebas unitarias y de componentes (Vitest). "pnpm test" mide la cobertura siempre.
    test: {
      passWithNoTests: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      coverage: {
        provider: "v8",
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/main.tsx", // arranque: solo monta <App />, no tiene lógica de negocio
          "src/vite-env.d.ts", // declaraciones de tipos: no generan código ejecutable
          "src/types/**", // solo interfaces de TypeScript: no generan código ejecutable
          "src/test/**", // configuración de pruebas: no tiene lógica de negocio
        ],
        // Línea base de la semana 1. Desde hoy no puede bajar; súbela cada semana
        // según el plan hasta llegar al 80% en la semana 8.
        thresholds: { lines: 0, branches: 0, functions: 0, statements: 0 },
      },
    },
  };
});
