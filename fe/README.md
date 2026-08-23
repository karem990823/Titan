# Frontend Módulo Académico - TITAN

Este proyecto es la interfaz de usuario (frontend) para el Módulo Académico de la plataforma TITAN. Ha sido desarrollado con React y permite gestionar la programación de cursos y la inscripción de participantes de manera eficiente.

##  Características Principales

El frontend del Módulo Académico incluye las siguientes funcionalidades:

*   **Programar Curso:** Permite a los administradores crear nuevas sesiones de formación, especificando el tipo de curso (Trabajo en alturas, Reentrenamiento, etc.), el instructor a cargo, la fecha, la hora y el número máximo de cupos disponibles.
*   **Inscribir Participante:** Facilita la inscripción de un participante a un curso ya programado. El sistema está preparado para realizar validaciones automáticas, como la disponibilidad de cupos, evitar inscripciones duplicadas y verificar requisitos del participante (ej. aptitud médica).
*   **Calendario de Cursos:** Ofrece una vista clara y organizada de todos los cursos programados. Muestra detalles importantes de cada sesión, como el nombre del curso, la fecha, la hora, los cupos restantes y el instructor asignado.

##  Cómo Empezar

Sigue estas instrucciones para obtener una copia del proyecto en funcionamiento en tu máquina local para desarrollo y pruebas.

### Pre-requisitos

Asegúrate de tener instalado Node.js y un gestor de paquetes (npm o yarn) en tu sistema.

*   [Node.js](https://nodejs.org/) (se recomienda v18 o superior)
*   [npm](https://www.npmjs.com/get-npm) o [yarn](https://yarnpkg.com/)

### Instalación

1.  Navega hasta el directorio raíz del proyecto `FrontendTitan`.

2.  Instala todas las dependencias necesarias ejecutando el siguiente comando en tu terminal:

    ```bash
    npm install
    ```

    O si prefieres usar yarn:

    ```bash
    yarn install
    ```

### Ejecución en Desarrollo

Para iniciar el servidor de desarrollo local, ejecuta:

```bash
npm run dev
```

o, dependiendo de la configuración de tu proyecto:

```bash
npm start
```

Esto iniciará la aplicación en modo de desarrollo. Abre http://localhost:5173 (o el puerto que indique la terminal) en tu navegador para ver la aplicación.

## ⚙️ Conexión con el Backend

Este frontend está diseñado para comunicarse con un servicio de backend. Las llamadas a la API se realizan al endpoint base `/api/cursos`.

Para que las peticiones funcionen correctamente en un entorno de desarrollo, es probable que necesites configurar un proxy en tu archivo de configuración de Vite (`vite.config.js`) o en el `package.json` si usas Create React App, para redirigir las peticiones al servidor backend que se ejecuta localmente.