/**
 * Datos de demostración de la plataforma.
 *
 * REGLA DE ORO DE ESTE ARCHIVO
 * ----------------------------
 * Todo el contenido es ficticio y existe únicamente para poblar la interfaz.
 * No se guarda nada de forma persistente, no se envían solicitudes a ningún
 * servicio y no se calcula ninguna nota.
 *
 * Al conectar la API real, este archivo debe ser el ÚNICO punto a sustituir:
 * los componentes consumen contratos con forma estable (id, title, status).
 *
 * Regla de contenido: no se inventan puntuaciones, ni escalas numéricas, ni
 * duraciones, ni criterios de evaluación. Los campos que dependen de decisiones
 * de la docente se dejan explícitamente vacíos para que la interfaz muestre un
 * estado vacío honesto en lugar de un dato inventado.
 */

/** Aviso reutilizado por toda la interfaz mediante el componente `DemoNotice`. */
export const DEMO_NOTICE = {
  title: 'Interfaz de demostración',
  message:
    'Las pantallas muestran datos ficticios de muestra. No se realiza ninguna operación persistente, no se calcula ninguna calificación y no se envía contenido a ningún servicio de inteligencia artificial.',
};

export const DEMO_STUDENT = Object.freeze({
  id: 'est-0001',
  name: 'Ana Moreno Prasad',
  email: 'ana.moreno@ejemplo.edu',
  initials: 'AM',
  program: 'Grado en Nutrición Humana y Dietética',
  course: 'Curso 2025-2026',
  cohort: 'Grupo A',
  emailVerified: true,
  profileCompleteness: 0.75,
  joinedAt: '2025-09-15',
});

export const DEMO_TEACHER = Object.freeze({
  id: 'doc-0001',
  name: 'Dra. Elena Ruiz Barrow',
  email: 'elena.ruiz@ejemplo.edu',
  initials: 'ER',
  department: 'Departamento de Bioquímica y Nutrición',
  title: 'Profesora titular',
});

/** Estados posibles de una actividad educativa en el panel docente. */
export const ACTIVITY_STATUS = Object.freeze({
  published: 'published',
  draft: 'draft',
});

/** Estados posibles de una actividad en el espacio estudiante. */
export const STUDENT_ACTIVITY_STATUS = Object.freeze({
  notStarted: 'not_started',
  inProgress: 'in_progress',
  completed: 'completed',
});

export const STATUS_LABELS = Object.freeze({
  [ACTIVITY_STATUS.published]: 'Publicada',
  [ACTIVITY_STATUS.draft]: 'Borrador',
  [STUDENT_ACTIVITY_STATUS.notStarted]: 'Sin iniciar',
  [STUDENT_ACTIVITY_STATUS.inProgress]: 'En curso',
  [STUDENT_ACTIVITY_STATUS.completed]: 'Finalizada',
});

export const DIFFICULTY_LEVELS = Object.freeze([
  { value: 'introductorio', label: 'Introductorio' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' },
]);

export const SUBJECT_AREAS = Object.freeze([
  { value: 'Bioquímica', label: 'Bioquímica' },
  { value: 'Nutrición clínica', label: 'Nutrición clínica' },
  { value: 'Fisiología', label: 'Fisiología' },
  { value: 'Metabolismo', label: 'Metabolismo' },
]);

export const LEVEL_LABELS = Object.freeze(
  Object.fromEntries(DIFFICULTY_LEVELS.map((level) => [level.value, level.label])),
);

/**
 * Catálogo de actividades. `tutorInstructions` es el prompt educativo que la
 * docente escribiría; la interfaz solo lo muestra y lo edita, nunca lo envía.
 */
export const ACTIVITIES = Object.freeze([
  {
    id: 'act-glucosa-ayuno',
    slug: 'regulacion-glucemia-ayuno',
    title: 'Regulación de la glucemia durante el ayuno prolongado',
    subject: 'Bioquímica',
    topic: 'Metabolismo de hidratos de carbono',
    difficulty: 'intermedio',
    summary:
      'Acompaña a una persona que consulta por episodios de debilidad y visión borrosa antes del desayuno, y ayúdala a razonar sobre los mecanismos que mantienen la glucemia durante el ayuno.',
    scenario:
      'Paciente de 54 años que refiere sensación de debilidad, temblor y dificultad para concentrarse durante los últimos cuarenta minutos del ayuno. Los síntomas desaparecen al desayuno y no hay manifestaciones posprandiales. Acude a consulta de nutrición para ajustar su patrón de comidas.',
    challenge:
      'Explica qué mecanismos mantienen la glucemia dentro de su rango durante el ayuno y por qué aparece la sintomatología. La respuesta debe sostenerse con argumentos sobre mecanismos concretos, no con definiciones aisladas.',
    objectives: [
      'Identificar el papel del hígado en el mantenimiento de la glucemia',
      'Diferenciar glucogenólisis, gluconeogénesis y cetogénesis',
      'Relacionar la sintomatología con las reservas de glucógeno del paciente',
    ],
    tutorInstructions:
      'Actúa como un profesional de nutrición clínica que acompaña a la paciente durante la consulta. Presenta la información del caso por partes y espera a que la persona estudiante explique su razonamiento antes de aportar el siguiente dato. No reveles la respuesta final ni completes los argumentos por la persona estudiante. Cuando su explicación sea incompleta, formula una pregunta que la haga precisar el mecanismo concreto en lugar de corregirla directamente. Si necesita un apoyo, ofrece una pista delimitada. Al final, solicita una síntesis breve.',
    status: ACTIVITY_STATUS.published,
    version: 3,
    updatedAt: '2026-02-11',
    author: DEMO_TEACHER.name,
    estimatedTime: null,
    rubric: [],
  },
  {
    id: 'act-lipoproteinas',
    slug: 'lipoproteinas-transporte-lipidos',
    title: 'Lipoproteínas y transporte de lípidos en sangre',
    subject: 'Bioquímica',
    topic: 'Metabolismo de lípidos',
    difficulty: 'introductorio',
    summary:
      'Estudia el caso de una paciente con disglicemia y perfil lipídico alterado, y relaciona los hallazgos con las rutas de transporte del colesterol y los triglicéridos.',
    scenario:
      'Paciente de 61 años con antecedentes de diabetes tipo 2 y un patrón de alimentación con exceso de grasas saturadas. Analítica con colesterol LDL elevado, triglicéridos moderados y HDL bajo. Sin síntomas evidentes: el hallazgo procede de un control rutinario.',
    challenge:
      'Determina qué partículas lipoproteicas están implicadas y por qué su proporción modifica el riesgo. Justifica cada afirmación indicando el transportador, el tejido de origen o destino y la enzima implicada.',
    objectives: [
      'Diferenciar quilomicrones, VLDL, LDL y HDL por composición y función',
      'Relacionar la lipólisis de quilomicrones con la formación de ácidos grasos libres',
      'Explicar el transporte inverso del colesterol',
    ],
    tutorInstructions:
      'Actúa como un docente de bioquímica durante una sesión de tutoría. Introduce el caso de forma progresiva y devuelve a la estudiante el control de la secuencia. Acepta razonamientos alternativos si están bien fundamentados. Señala los errores conceptuales con una pregunta, no con una afirmación. Pide siempre el nombre de la proteína o enzima implicada.',
    status: ACTIVITY_STATUS.published,
    version: 2,
    updatedAt: '2026-02-04',
    author: DEMO_TEACHER.name,
    estimatedTime: null,
    rubric: [],
  },
  {
    id: 'act-vitamina-d',
    slug: 'vitamina-d-homeostasis-calcio',
    title: 'Vitamina D y homeostasis del calcio',
    subject: 'Nutrición clínica',
    topic: 'Vitaminas y regulación mineral',
    difficulty: 'intermedio',
    summary:
      'Analiza un déficit de vitamina D con calcio ionizado en el límite inferior y pide a la estudiante que construya la cascada reguladora completa, desde la piel hasta la secreción de hormona paratiroidea.',
    scenario:
      'Mujer de 68 años con dolor óseo difuso y fatiga. Analítica con 25-hidroxivitamina D baja y calcio ionizado en el límite inferior de la normalidad.',
    challenge:
      'Ordena cronológicamente los pasos de la vía de la vitamina D y explica qué ocurre con la retroalimentación negativa cuando la concentración de calcio ionizado desciende.',
    objectives: [
      'Describir las etapas de hidroxilación de la vitamina D',
      'Explicar la regulación de la hormona paratiroidea por calcio y fosfato',
      'Relacionar los valores analíticos con la fisiología de la paciente',
    ],
    tutorInstructions:
      'Simula a un profesor de fisiología que evalúa comprensión profunda. Nunca aceptes una lista memorizada como explicación: pide en todo momento el porqué fisiológico. Utiliza preguntas socráticas y deja que la estudiante concluya. Señala explícitamente cuándo una respuesta es correcta y cuándo es solo memorización.',
    status: ACTIVITY_STATUS.published,
    version: 1,
    updatedAt: '2026-01-28',
    author: DEMO_TEACHER.name,
    estimatedTime: null,
    rubric: [],
  },
  {
    id: 'act-estres-oxidativo',
    slug: 'estres-oxidativo-antioxidantes',
    title: 'Estrés oxidativo y sistemas antioxidantes',
    subject: 'Metabolismo',
    topic: 'Biomoléculas y defensa celular',
    difficulty: 'avanzado',
    summary:
      'Estudio de caso sobre la defensa antioxidant y su relación con el metabolismo intermediario. Plantea la discusión sobre el uso de suplementos sin cerrar la conclusión.',
    scenario:
      'Paciente con cardiopatía isquémica que consume un suplemento con polifenoles. Se solicita criterio sobre su uso.',
    challenge:
      'Valora la evidencia disponible y explica por qué el conocimiento de las vías de acción no basta para justificar la suplementación. Estructura tu respuesta separando mecanismo, evidencia y recomendación.',
    objectives: [
      'Identificar las principales fuentes de especies reactivas en la mitocondria',
      'Describir los sistemas de defensa enzimáticos y no enzimáticos',
      'Distinguir plausibilidad mecanística de evidencia clínica',
    ],
    tutorInstructions:
      'Mantén una postura de tutoría socrática y neutral. No expreses una opinión clínica propia. Cuando la estudiante afirme que un suplemento es antioxidante, exige que precise a qué se refiere y con qué evidencia. Admite que hay cuestiones de debate abierto en la literatura.',
    status: ACTIVITY_STATUS.draft,
    version: 4,
    updatedAt: '2026-02-18',
    author: DEMO_TEACHER.name,
    estimatedTime: null,
    rubric: [],
  },
  {
    id: 'act-termogenesis',
    slug: 'termogenesis-gasto-energetico',
    title: 'Termogénesis y composición del gasto energético',
    subject: 'Fisiología',
    topic: 'Metabolismo energético',
    difficulty: 'introductorio',
    summary:
      'Pide a la estudiante que descomponga el gasto energético total en sus componentes y evalúe el efecto termogénico de distintos grupos de alimentos.',
    scenario:
      'Paciente que solicita un plan de alimentación y requiere una estimación de su gasto energético para ajustar su patrón de comidas.',
    challenge:
      'Explica cómo se estima el gasto energético en consulta y por qué la termogénesis de la dieta explica solo una parte del balance energético.',
    objectives: [
      'Enumerar los componentes del gasto energético total',
      'Describir el efecto termogénico de los macronutrientes',
      'Interpretar cómo las cifras de referencia se aplican a un caso concreto',
    ],
    tutorInstructions:
      'Actúa como un nutricionista clínico en consulta. Trabaja con la estudiante como si necesitaras construir el razonamiento completo antes de proponer nada. No proportions cifras cerradas: guía el cálculo paso a paso y pide que la estudiante anticipe el resultado antes de revelarlo.',
    status: ACTIVITY_STATUS.draft,
    version: 1,
    updatedAt: '2026-02-19',
    author: DEMO_TEACHER.name,
    estimatedTime: null,
    rubric: [],
  },
  {
    id: 'act-aminoacidos',
    slug: 'sintesis-proteica-aminoacidos',
    title: 'Síntesis proteica y destino de los aminoácidos',
    subject: 'Bioquímica',
    topic: 'Metabolismo de aminoácidos',
    difficulty: 'intermedio',
    summary:
      'Estudio de caso sobre un paciente con malnutrición y el impacto del déficit de aminoácidos en la síntesis proteica y en la respuesta inmunitaria.',
    scenario:
      'Paciente adulto con pérdida ponderal reciente, cirugía reciente y albúmina sérica por debajo de la normalidad. Se solicita el plan nutricional de soporte.',
    challenge:
      'Explica cómo la síntesis proteica depende de la disponibilidad de aminoácidos esenciales y qué ocurre con los aminoácidos de cadena ramificada en estados de estrés metabólico.',
    objectives: [
      'Describir las fases de la síntesis proteica',
      'Relacionar el pool de aminoácidos libres con la ingesta',
      'Explicar el papel de los aminoácidos de cadena ramificada en el estrés metabólico',
    ],
    tutorInstructions:
      'Simula a un supervisor clínico durante la presentación de un caso. Exige vocabulario técnico preciso. Si la estudiante describe el proceso sin nombrar las estructuras, pídele que las identifique. Plantea un segundo escenario cuando el primero esté resuelto para comprobar si el razonamiento se transfiere.',
    status: ACTIVITY_STATUS.draft,
    version: 2,
    updatedAt: '2026-02-16',
    author: DEMO_TEACHER.name,
    estimatedTime: null,
    rubric: [],
  },
]);

/** Actividad destacada en la página de inicio. */
export const FEATURED_ACTIVITY_ID = 'act-glucosa-ayuno';

/** Progreso del estudiante de demostración por actividad. */
export const STUDENT_ACTIVITY_STATE = Object.freeze({
  'act-glucosa-ayuno': {
    status: STUDENT_ACTIVITY_STATUS.inProgress,
    lastActivityAt: '2026-02-20',
    turnsSoFar: 4,
  },
  'act-lipoproteinas': {
    status: STUDENT_ACTIVITY_STATUS.inProgress,
    lastActivityAt: '2026-02-18',
    turnsSoFar: 2,
  },
  'act-vitamina-d': {
    status: STUDENT_ACTIVITY_STATUS.completed,
    lastActivityAt: '2026-02-12',
    turnsSoFar: 7,
  },
  'act-termogenesis': {
    status: STUDENT_ACTIVITY_STATUS.notStarted,
    lastActivityAt: null,
    turnsSoFar: 0,
  },
  'act-estres-oxidativo': {
    status: STUDENT_ACTIVITY_STATUS.notStarted,
    lastActivityAt: null,
    turnsSoFar: 0,
  },
  'act-aminoacidos': {
    status: STUDENT_ACTIVITY_STATUS.notStarted,
    lastActivityAt: null,
    turnsSoFar: 0,
  },
});

/**
 * Conversaciones de ejemplo. Se cargan al abrir el simulador para ilustrar el
 * comportamiento de la interfaz. Los mensajes de la derecha (rol `tutor`)
 * representarías contenido redactado para la demostración: no proceden de
 * ningún modelo y el sistema no produce respuestas.
 */
export const DEMO_CONVERSATIONS = Object.freeze({
  'act-glucosa-ayuno': [
    {
      id: 'msg-1',
      role: 'tutor',
      author: DEMO_TEACHER.name,
      at: '09:12',
      content:
        'Buenos días. Antes de empezar, cuéntame en tus palabras qué le preocupa de la consulta y qué te gustaría resolver al final de la conversación.',
    },
    {
      id: 'msg-2',
      role: 'student',
      author: DEMO_STUDENT.name,
      at: '09:13',
      content:
        'Le preocupan los episodios de debilidad antes del desayuno. Me gustaría entender qué le ocurre a su glucosa y qué puede cambiar en su patrón de comidas.',
    },
    {
      id: 'msg-3',
      role: 'tutor',
      author: DEMO_TEACHER.name,
      at: '09:13',
      content:
        'Vamos paso a paso. Empieza por lo más sencillo: si una persona lleva doce horas sin comer, ¿de dónde obtiene el organismo la glucosa que necesita?\n\nUn dato para que no calcules sobre supuestos: la paciente pesa setenta y cuatro kilos y no tiene antecedentes de diabetes diagnosticada.',
    },
    {
      id: 'msg-4',
      role: 'student',
      author: DEMO_STUDENT.name,
      at: '09:15',
      content:
        'Del glucógeno almacenado, principalmente en el hígado. El músculo también tiene reservas, pero no liberan glucosa a la sangre porque carecen del transportador adecuado.',
    },
    {
      id: 'msg-5',
      role: 'tutor',
      author: DEMO_TEACHER.name,
      at: '09:15',
      content:
        'Correcto, y has mencionado algo que suele pasarse por alto: la diferencia entre ambos tejidos.\n\nAhora pregúntate lo siguiente.\n\n- Si las reservas hepáticas duran entre doce y veinticuatro horas, ¿qué ocurre en la paciente a partir de la segunda jornada de ayuno prolongado?\n- ¿Qué dos sustratos alternativos usaría el hígado, y en qué condiciones se prioriza uno u otro?\n- ¿Qué diferencia hay, en términos de rendimiento, entre usar un sustrato y usar el otro?',
    },
    {
      id: 'msg-6',
      role: 'student',
      author: DEMO_STUDENT.name,
      at: '09:18',
      content:
        'Pasado ese tiempo el hígado tendría que recurrir a la gluconeogénesis, y la cetogénesis se vuelve relevante. Se usan aminoácidos, glicerol y, en menor proporción, lactato.',
    },
  ],
  'act-lipoproteinas': [
    {
      id: 'msg-1',
      role: 'tutor',
      author: DEMO_TEACHER.name,
      at: '11:02',
      content:
        'Te paso la analítica de la paciente. Antes de interpretarla, dime qué partículas lipoproteicas conoces y qué transporta cada una.',
    },
    {
      id: 'msg-2',
      role: 'student',
      author: DEMO_STUDENT.name,
      at: '11:04',
      content:
        'Los quilomicrones llevan triglicéridos y colesterol desde el intestino. El VLDL sale del hígado y, al perder triglicéridos, se convierte en LDL. El HDL hace el camino de vuelta.',
    },
  ],
  'act-vitamina-d': [
    {
      id: 'msg-1',
      role: 'tutor',
      author: DEMO_TEACHER.name,
      at: '16:20',
      content:
        'Tenemos una paciente con 25-hidroxivitamina D baja y calcio ionizado en el límite inferior. ¿Por dónde empezaría el razonamiento?',
    },
    {
      id: 'msg-2',
      role: 'student',
      author: DEMO_STUDENT.name,
      at: '16:22',
      content:
        'Primero comprobaría si la vitamina D baja es la causa o la consecuencia, porque la propia hormona regula la absorción intestinal de calcio. Necesito ver la cascada completa antes de concluir.',
    },
  ],
});

/**
 * Retroalimentación de demostración. No contiene notas, puntuaciones ni
 * escalas: la docente aún no ha definido los criterios de evaluación.
 */
export const DEMO_RESULTS = Object.freeze({
  'act-vitamina-d': {
    activityId: 'act-vitamina-d',
    overallComment:
      'El razonamiento mantiene la relación entre vía reguladora y hallazgo analítico, y detecta correctamente la bidireccionalidad del eje. El punto a reforzar es la descripción temporal de las hidroxilaciones.',
    strengths: [
      'Distingue causa de consecuencia antes de concluir',
      'Identifica la retroalimentación negativa sin que se le sugiera',
      'Mantiene un vocabulario técnico preciso',
    ],
    improvementAreas: [
      'Situar en el tiempo cada etapa de la síntesis de la forma activa',
      'Explicar qué ocurre con la hormona paratiroidea cuando el calcio ionizado desciende',
    ],
    criteriaPending: true,
    teacherComment:
      'Sesión de tutoría de 25 minutos. La estudiante inició el razonamiento por el objetivo y no por el dato.',
    transcriptAvailable: true,
  },
});

/** Estudiantes ficticios del panel docente. */
export const DEMO_STUDENTS = Object.freeze([
  {
    id: 'est-0001',
    name: 'Ana Moreno Prasad',
    email: 'ana.moreno@ejemplo.edu',
    initials: 'AM',
    program: 'Nutrición Humana y Dietética',
    cohort: 'Grupo A',
    lastSeenAt: '2026-02-20',
    activityStates: {
      'act-glucosa-ayuno': STUDENT_ACTIVITY_STATUS.inProgress,
      'act-vitamina-d': STUDENT_ACTIVITY_STATUS.completed,
      'act-lipoproteinas': STUDENT_ACTIVITY_STATUS.inProgress,
    },
  },
  {
    id: 'est-0002',
    name: 'Luis Fernández Cuesta',
    email: 'luis.fernandez@ejemplo.edu',
    initials: 'LF',
    program: 'Nutrición Humana y Dietética',
    cohort: 'Grupo A',
    lastSeenAt: '2026-02-19',
    activityStates: {
      'act-glucosa-ayuno': STUDENT_ACTIVITY_STATUS.completed,
    },
  },
  {
    id: 'est-0003',
    name: 'Sofía Barreto Gil',
    email: 'sofia.barreto@ejemplo.edu',
    initials: 'SB',
    program: 'Nutrición Humana y Dietética',
    cohort: 'Grupo B',
    lastSeenAt: '2026-02-18',
    activityStates: {
      'act-lipoproteinas': STUDENT_ACTIVITY_STATUS.inProgress,
    },
  },
  {
    id: 'est-0004',
    name: 'Diego Nájera Ortiz',
    email: 'diego.najera@ejemplo.edu',
    initials: 'DN',
    program: 'Nutrición Humana y Dietética',
    cohort: 'Grupo B',
    lastSeenAt: '2026-02-11',
    activityStates: {
      'act-vitamina-d': STUDENT_ACTIVITY_STATUS.completed,
      'act-glucosa-ayuno': STUDENT_ACTIVITY_STATUS.completed,
    },
  },
  {
    id: 'est-0005',
    name: 'Marta Sandoval Peña',
    email: 'marta.sandoval@ejemplo.edu',
    initials: 'MS',
    program: 'Nutrición Humana y Dietética',
    cohort: 'Grupo A',
    lastSeenAt: null,
    activityStates: {},
  },
  {
    id: 'est-0006',
    name: 'Hugo Cabrera Luna',
    email: 'hugo.cabrera@ejemplo.edu',
    initials: 'HC',
    program: 'Nutrición Humana y Dietética',
    cohort: 'Grupo B',
    lastSeenAt: '2026-02-20',
    activityStates: {
      'act-glucosa-ayuno': STUDENT_ACTIVITY_STATUS.inProgress,
    },
  },
]);

/**
 * Señales de seguimiento de una sesión en curso. Son valores de interfaz
 * (tiempo y tipo de evento) y no métricas de calificación ni indicadores de
      plagio. La arquitectura del proyecto las trata como informativas.
 */
export const DEMO_MONITORING = Object.freeze({
  activityId: 'act-glucosa-ayuno',
  sessionId: 'ses-demo-0001',
  student: DEMO_STUDENTS[0],
  startedAt: '2026-02-20 09:12',
  lastSeenLabel: 'hace 4 minutos',
  events: [
    { id: 'ev-1', label: 'Sesión iniciada', at: '09:12', kind: 'info' },
    { id: 'ev-2', label: 'Ventana de actividad perdida', at: '09:21', kind: 'warning' },
    { id: 'ev-3', label: 'Ventana recuperada', at: '09:23', kind: 'info' },
    { id: 'ev-4', label: 'Intento de pegado bloqueado', at: '09:26', kind: 'warning' },
  ],
  conversation: DEMO_CONVERSATIONS['act-glucosa-ayuno'],
});

/** Preguntas frecuentes de la página de inicio. */
export const FAQ_ITEMS = Object.freeze([
  {
    question: '¿Qué es una simulación en esta plataforma?',
    answer:
      'Es una conversación escrita y guiada donde una persona estudiante practica un razonamiento clínico o bioquímico frente a un escenario concreto. La docente define el caso, el rol y los objetivos; la plataforma muestra la interfaz donde ese intercambio tendrá lugar.',
  },
  {
    question: '¿Quién define el contenido de cada actividad?',
    answer:
      'La docente responsable. Cada actividad incluye un escenario, un rol para quien acompaña y unas instrucciones de tutoría que la docente escribe y ajusta.',
  },
  {
    question: '¿Cómo se evalúa el trabajo de la persona estudiante?',
    answer:
      'Los criterios de evaluación todavía no están definidos. La docente establecerá la rúbrica y su ponderación antes de que la plataforma compute cualquier resultado.',
  },
  {
    question: '¿Qué se ve ahora mismo en esta versión?',
    answer:
      'La interfaz completa de la plataforma con datos de muestra. La autenticación, el almacenamiento y el funcionamiento del simulador se incorporan en fases posteriores.',
  },
]);
