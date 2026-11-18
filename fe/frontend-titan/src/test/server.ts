import { setupServer } from "msw/node";

// Servidor falso compartido: cada test agrega sus handlers con server.use(...)
export const server = setupServer();
