# Bioquímica Nutricional · MVP

Aplicación React/Vite y API Express con PostgreSQL. Docentes crean cursos y simulaciones; estudiantes se inscriben y conversan con Gemini en simulaciones publicadas usando su propia API key.

## Requisitos

- Node.js 20 o superior
- pnpm 9 o superior
- PostgreSQL 15 o superior

## Arranque local

1. Crea una base PostgreSQL vacía, por ejemplo `bioquimica_nutricional`.
2. Copia `.env.example` a `apps/api/.env` y configura `DATABASE_URL` y un `JWT_SECRET` aleatorio de al menos 32 caracteres. La API carga ese archivo desde `apps/api`.
3. Ejecuta `pnpm install`.
4. Ejecuta `pnpm db:migrate`. El script aplica `001`, `002` y `003` una sola vez y conserva los datos en ejecuciones posteriores.
5. Ejecuta `pnpm dev` y abre `http://localhost:5173`.

La web usa `http://localhost:3001/api` por defecto. Para otra URL, crea `apps/web/.env` con `VITE_API_URL` antes de iniciar Vite. Permite cookies y configura `WEB_ORIGIN` con el origen exacto de la web.

## Recorrido de prueba

1. Crea una cuenta con rol **Docente** e inicia sesión.
2. En **Mis cursos**, crea un curso disponible para estudiantes.
3. Abre el curso, crea una simulación y publícala con la casilla del formulario o el botón del listado.
4. Pulsa **Salir** y crea una cuenta con rol **Estudiante**.
5. Abre el curso, pulsa **Inscribirme** y entra en la simulación.
6. Introduce tu API key de Gemini y pulsa **Probar conexión**. Luego pulsa **Iniciar simulación** y conversa con el tutor.
7. Recarga la página o reinicia `pnpm dev` y comprueba que la conversación continúa allí.

El estudiante nunca recibe los borradores ni las instrucciones internas del tutor en la interfaz. Las operaciones docentes se filtran por el ID del usuario autenticado en la API.

La clave de Gemini se guarda temporalmente en `sessionStorage` para la pestaña y el usuario actual, y se borra al cerrar sesión o al usar **Eliminar de esta sesión**. Se envía al backend únicamente en las peticiones a Gemini; no se guarda en PostgreSQL ni se incluye en respuestas o registros. El historial sí persiste. Configura `GEMINI_MODEL` en `apps/api/.env` si necesitas cambiar el modelo de texto (valor inicial: `gemini-3.5-flash-lite`).

## Verificación

`pnpm check` compila web/API y ejecuta pruebas. Con `DATABASE_URL` configurada, las pruebas de integración verifican el recorrido docente–estudiante, el contexto del chat, la persistencia después de reiniciar el servidor y el aislamiento entre estudiantes. La prueba automática del chat usa un proveedor simulado; para verificar una respuesta real se necesita una API key propia de Gemini.

## Datos

Se reutilizan `users`, `clinical_cases`, `simulation_sessions` y `conversation_messages` de la migración inicial. La migración `002` añade `courses`, `enrollments` y `clinical_cases.course_id`. La migración `003` limita a una sesión activa por estudiante y simulación. Las tablas de evaluación y supervisión siguen sin uso. Las pantallas demo antiguas permanecen en el repositorio como referencia, pero no forman parte del enrutado activo.
