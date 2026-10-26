import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Sin "globals: true" en vitest.config, RTL no detecta el framework de
// pruebas y no limpia el DOM solo entre tests: lo hacemos explícito aquí.
afterEach(() => {
  cleanup();
});
