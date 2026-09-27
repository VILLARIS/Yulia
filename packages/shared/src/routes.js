/**
 * Contrato único de navegación compartido entre el frontend y cualquier
 * consumidor backend. Cualquier ruta nueva debe declararse aquí y Consumirse
 * desde la aplicación, nunca hardcodearse en un componente.
 */

export const APP_ROUTES = Object.freeze({
  home: '/',
  login: '/acceso',
  register: '/registro',
  forgotPassword: '/recuperar-contrasena',
  simulations: '/simulaciones',
  simulation: '/simulaciones/:activityId/simular',
  activityDetail: '/simulaciones/:activityId',
  results: '/resultados/:activityId',
  studentDashboard: '/estudiante',
  studentActivities: '/estudiante/actividades',
  studentActivityDetail: '/estudiante/actividades/:activityId',
  studentProfile: '/estudiante/perfil',
  teacherDashboard: '/docente',
  teacherActivities: '/docente/actividades',
  teacherActivityCreate: '/docente/actividades/nueva',
  teacherActivityEdit: '/docente/actividades/:activityId/editar',
  teacherStudents: '/docente/estudiantes',
  teacherMonitoring: '/docente/seguimiento',
  teacherResults: '/docente/resultados',
});

export const ROUTE_GROUPS = Object.freeze({
  public: 'public',
  student: 'student',
  teacher: 'teacher',
});

export const PHASES = Object.freeze({
  foundation: 1,
  access: 2,
  catalog: 2,
  activity: 3,
  simulation: 3,
  authoring: 4,
  results: 5,
  supervision: 5,
});

/**
 * Metadatos de presentación derivados de APP_ROUTES. Sirven tanto para el
 * enrutado como para la navegación, de modo que la interfaz nunca pueda
 * enlazar a una ruta inexistente.
 */
export const ROUTE_DEFINITIONS = Object.freeze([
  { key: 'home', label: 'Inicio', group: ROUTE_GROUPS.public, phase: PHASES.foundation },
  { key: 'login', label: 'Acceso', group: ROUTE_GROUPS.public, phase: PHASES.access },
  { key: 'register', label: 'Crear cuenta', group: ROUTE_GROUPS.public, phase: PHASES.access },
  { key: 'forgotPassword', label: 'Recuperar contraseña', group: ROUTE_GROUPS.public, phase: PHASES.access },
  { key: 'simulations', label: 'Simulaciones', group: ROUTE_GROUPS.public, phase: PHASES.catalog },
  { key: 'activityDetail', label: 'Detalle del escenario', group: ROUTE_GROUPS.public, phase: PHASES.activity },
  { key: 'simulation', label: 'Simulador', group: ROUTE_GROUPS.public, phase: PHASES.simulation },
  { key: 'results', label: 'Resultados', group: ROUTE_GROUPS.student, phase: PHASES.results },
  { key: 'studentDashboard', label: 'Mi aprendizaje', group: ROUTE_GROUPS.student, phase: PHASES.access },
  { key: 'studentActivities', label: 'Actividades', group: ROUTE_GROUPS.student, phase: PHASES.access },
  { key: 'studentActivityDetail', label: 'Actividad', group: ROUTE_GROUPS.student, phase: PHASES.activity },
  { key: 'studentProfile', label: 'Perfil', group: ROUTE_GROUPS.student, phase: PHASES.access },
  { key: 'teacherDashboard', label: 'Panel docente', group: ROUTE_GROUPS.teacher, phase: PHASES.authoring },
  { key: 'teacherActivities', label: 'Actividades', group: ROUTE_GROUPS.teacher, phase: PHASES.authoring },
  { key: 'teacherActivityCreate', label: 'Nueva actividad', group: ROUTE_GROUPS.teacher, phase: PHASES.authoring },
  { key: 'teacherActivityEdit', label: 'Editar actividad', group: ROUTE_GROUPS.teacher, phase: PHASES.authoring },
  { key: 'teacherStudents', label: 'Estudiantes', group: ROUTE_GROUPS.teacher, phase: PHASES.supervision },
  { key: 'teacherMonitoring', label: 'Seguimiento', group: ROUTE_GROUPS.teacher, phase: PHASES.supervision },
  { key: 'teacherResults', label: 'Resultados', group: ROUTE_GROUPS.teacher, phase: PHASES.results },
]);

export const PUBLIC_NAVIGATION = Object.freeze([
  { label: 'Inicio', to: APP_ROUTES.home },
  { label: 'Simulaciones', to: APP_ROUTES.simulations },
]);

export const STUDENT_NAVIGATION = Object.freeze([
  { label: 'Mi aprendizaje', to: APP_ROUTES.studentDashboard },
  { label: 'Actividades', to: APP_ROUTES.studentActivities },
  { label: 'Perfil', to: APP_ROUTES.studentProfile },
]);

export const TEACHER_NAVIGATION = Object.freeze([
  { label: 'Panel', to: APP_ROUTES.teacherDashboard },
  { label: 'Actividades', to: APP_ROUTES.teacherActivities },
  { label: 'Estudiantes', to: APP_ROUTES.teacherStudents },
  { label: 'Seguimiento', to: APP_ROUTES.teacherMonitoring },
  { label: 'Resultados', to: APP_ROUTES.teacherResults },
]);

export const FOOTER_SECTIONS = Object.freeze([
  {
    title: 'Plataforma',
    links: [
      { label: 'Inicio', to: APP_ROUTES.home },
      { label: 'Catálogo de simulaciones', to: APP_ROUTES.simulations },
    ],
  },
  {
    title: 'Espacio estudiante',
    links: [
      { label: 'Mi aprendizaje', to: APP_ROUTES.studentDashboard },
      { label: 'Actividades', to: APP_ROUTES.studentActivities },
      { label: 'Perfil', to: APP_ROUTES.studentProfile },
    ],
  },
  {
    title: 'Espacio docente',
    links: [
      { label: 'Panel docente', to: APP_ROUTES.teacherDashboard },
      { label: 'Gestión de actividades', to: APP_ROUTES.teacherActivities },
      { label: 'Seguimiento', to: APP_ROUTES.teacherMonitoring },
    ],
  },
]);

/**
 * Sustituye los parámetros `:nombre` de una plantilla de ruta por sus valores.
 * Lanza un error en desarrollo si falta un parámetro, para que una ruta rota
 * falle de forma visible en lugar de navegar a una URL inválida.
 */
export function buildPath(template, params = {}) {
  return template.replace(/:([A-Za-z0-9_]+)/g, (match, key) => {
    const value = params[key];
    if (value === undefined || value === null || value === '') {
      throw new Error(`Falta el parámetro "${key}" para construir la ruta "${template}".`);
    }
    return encodeURIComponent(String(value));
  });
}

export function routeFor(key, params) {
  const template = APP_ROUTES[key];
  if (!template) {
    throw new Error(`La ruta "${key}" no está declarada en APP_ROUTES.`);
  }
  return buildPath(template, params);
}

/** Devuelve la definición de una ruta a partir de su clave. */
export function definitionFor(key) {
  return ROUTE_DEFINITIONS.find((definition) => definition.key === key) ?? null;
}
