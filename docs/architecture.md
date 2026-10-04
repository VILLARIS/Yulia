# Arquitectura del MVP

## Flujo activo

Navegador React/Vite → `apps/web/src/mvp/api.js` → API Express → PostgreSQL.

La API identifica al usuario mediante una cookie `HttpOnly` firmada. La web restaura la sesión con `GET /api/auth/me` y protege las rutas por rol. La API vuelve a verificar el rol y la propiedad en cada operación; los controles del navegador no sustituyen esos filtros.

## Datos

- `users`: identidad, contraseña derivada con `scrypt`, rol y fecha de creación.
- `courses`: curso, docente propietario, publicación y fechas.
- `clinical_cases`: simulaciones del MVP; `course_id` las vincula a un curso. Los campos `clinical_situation`, `academic_challenge` y `tutor_instructions` corresponden a escenario, objetivo e instrucciones.
- `enrollments`: inscripción única por estudiante y curso.
- `simulation_sessions`: una conversación activa por estudiante y simulación (índice de la migración `003`).
- `conversation_messages`: turnos persistentes. `model_metadata` conserva los pasos necesarios para reenviar el contexto a Interactions API.
- `schema_migrations`: versiones SQL aplicadas.

La migración inicial contiene también tablas de evaluación, seguimiento y grabaciones; siguen sin uso. Las actividades anteriores sin `course_id` tampoco se muestran en las rutas activas. La API key de cada estudiante permanece solo en `sessionStorage` de su pestaña y viaja al backend por petición. No se guarda en PostgreSQL.

## Rutas web activas

- `/`, `/acceso`, `/registro` son públicas.
- `/docente` lista cursos propios; `/docente/cursos/nuevo`, `/docente/cursos/:courseId` y `/docente/cursos/:courseId/editar` permiten crearlos y editarlos.
- `/docente/cursos/:courseId/simulaciones/nueva` y `/docente/simulaciones/:simulationId/editar` gestionan simulaciones propias.
- `/estudiante` lista cursos publicados; `/estudiante/cursos/:courseId` gestiona la inscripción y muestra simulaciones publicadas; `/estudiante/simulaciones/:simulationId` muestra el caso y el chat.

La integración usa el SDK `@google/genai` y Interactions API con `store: false`. Cada petición reconstruye el historial desde PostgreSQL e incluye las instrucciones actuales del tutor. El modelo se configura con `GEMINI_MODEL`.

El frontend antiguo de demostración y el contrato `packages/shared/src/routes.js` permanecen en el repositorio, pero el enrutado activo se define en `apps/web/src/App.jsx`. Deben revisarse antes de reutilizarlos en fases posteriores.

## Fuera de alcance

Evaluación, rúbricas, supervisión, grabaciones, recuperación de contraseña y administración institucional.
