# Arquitectura de la plataforma

## Principios

- Separación estricta entre interfaz, reglas académicas, integración de IA y persistencia.
- El backend es la única autoridad para autenticación, autorización, avance de etapas y calificación.
- Las respuestas del estudiante se consideran contenido no confiable, nunca instrucciones del sistema.
- Los eventos de supervisión se almacenan de forma independiente de la rúbrica académica.
- Los casos clínicos son datos configurables; agregar un caso no requiere modificar la lógica visual.

## Capas

1. **Web**: navegación, accesibilidad, estados de carga/error y experiencia de simulación.
2. **API**: autenticación, autorización por rol, sesiones, conversación, evaluación y supervisión.
3. **Dominio compartido**: etapas, rutas y definición de casos clínicos.
4. **Persistencia**: PostgreSQL con migraciones versionadas y relaciones explícitas.
5. **Proveedores**: OpenAI y almacenamiento privado de grabaciones, encapsulados detrás de servicios.

## Límites de seguridad

- El navegador nunca envía instrucciones del sistema ni decide una calificación.
- La API deriva el usuario autenticado del token, no de un identificador libre del cuerpo.
- Los accesos docentes se filtran por rol y ámbito institucional.
- La grabación permanece desactivada por defecto y exige consentimiento del navegador.
- La telemetría de supervisión informa; no prueba plagio ni reduce notas automáticamente.

## Rutas

Las rutas se declaran una sola vez en `packages/shared/src/routes.js` (`APP_ROUTES`) y tanto el
enrutado de la aplicación como la navegación se derivan de ese contrato mediante `buildPath()`.
La tabla siguiente refleja las rutas realmente implementadas en el frontend.

| Ruta | Propósito | Espacio |
| --- | --- | --- |
| `/` | Inicio de la plataforma | Público |
| `/acceso` | Inicio de sesión (sin autenticación real) | Público |
| `/registro` | Creación de cuenta (sin servicio de registro) | Público |
| `/recuperar-contrasena` | Recuperación de contraseña (sin envío de correo) | Público |
| `/simulaciones` | Catálogo de actividades | Público |
| `/simulaciones/:activityId` | Ficha del escenario | Público |
| `/simulaciones/:activityId/simular` | Interfaz de conversación | Público |
| `/resultados/:activityId` | Resultados cualitativos de muestra | Estudiante |
| `/estudiante` | Mi aprendizaje | Estudiante |
| `/estudiante/actividades` | Actividades de la estudiante | Estudiante |
| `/estudiante/actividades/:activityId` | Detalle de actividad | Estudiante |
| `/estudiante/perfil` | Perfil de la estudiante | Estudiante |
| `/docente` | Panel docente | Docente |
| `/docente/actividades` | Gestión de actividades | Docente |
| `/docente/actividades/nueva` | Editor de actividad | Docente |
| `/docente/actividades/:activityId/editar` | Edición de actividad e instrucciones | Docente |
| `/docente/estudiantes` | Listado de estudiantes de muestra | Docente |
| `/docente/seguimiento` | Seguimiento de sesión de muestra | Docente |
| `/docente/resultados` | Resultados del grupo | Docente |

Cualquier ruta no incluida en este contrato resuelve en la pantalla de error 404. No existen rutas
de historial, de calificación ni de gestión de credenciales de proveedores.

