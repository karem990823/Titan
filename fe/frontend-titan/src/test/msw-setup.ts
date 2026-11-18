import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./server";

beforeAll(() => {
  // Una petición sin handler hace fallar el test: así no hay llamadas a la red por accidente
  server.listen({ onUnhandledRequest: "error" });

  // apiFetch usa rutas relativas ("/api/..."); fetch de Node necesita URL absoluta
  const fetchConMsw = globalThis.fetch;
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === "string" && input.startsWith("/")) {
      return fetchConMsw(new URL(input, window.location.origin).href, init);
    }
    return fetchConMsw(input, init);
  }) as typeof fetch;
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());
