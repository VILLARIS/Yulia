/**
 * Estado de demostración del espacio de trabajo.
 *
 * IMPORTANTE: este estado vive únicamente en memoria de la pestaña. No se
 * escribe en `localStorage`, no se envía a ningún servidor y se pierde al
 * recargar. Es deliberado: una etapa de frontend no debe aparentar persistencia
 * que no existe. Al conectar la API, este provider es el punto de sustitución,
 * y los componentes consumidores no necesitan cambiar.
 */

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  ACTIVITIES,
  ACTIVITY_STATUS,
  DEMO_CONVERSATIONS,
  DEMO_NOTICE,
  DEMO_RESULTS,
  DEMO_STUDENT,
  DEMO_STUDENTS,
  DEMO_TEACHER,
  FEATURED_ACTIVITY_ID,
  STUDENT_ACTIVITY_STATE,
} from '../data/demoData';

const DemoWorkspaceContext = createContext(null);

function generateId() {
  return `act-demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function DemoWorkspaceProvider({ children }) {
  const [activities, setActivities] = useState(() => ACTIVITIES.map((activity) => ({ ...activity })));
  const [conversations, setConversations] = useState(() => ({ ...DEMO_CONVERSATIONS }));
  const [results] = useState(() => ({ ...DEMO_RESULTS }));

  const getActivity = useCallback(
    (id) => activities.find((activity) => activity.id === id) ?? null,
    [activities],
  );

  const createActivity = useCallback((input) => {
    const activity = {
      id: generateId(),
      slug: input.slug ?? `actividad-${Date.now().toString(36)}`,
      status: ACTIVITY_STATUS.draft,
      version: 1,
      updatedAt: new Date().toISOString().slice(0, 10),
      author: DEMO_TEACHER.name,
      estimatedTime: null,
      rubric: [],
      objectives: [],
      ...input,
    };
    setActivities((current) => [activity, ...current]);
    setConversations((current) => ({ ...current, [activity.id]: [] }));
    return activity;
  }, []);

  const updateActivity = useCallback((id, patch) => {
    setActivities((current) =>
      current.map((activity) =>
        activity.id === id
          ? {
              ...activity,
              ...patch,
              version: activity.version + 1,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : activity,
      ),
    );
  }, []);

  const duplicateActivity = useCallback(
    (id) => {
      const source = activities.find((activity) => activity.id === id);
      if (!source) return null;

      const copy = {
        ...source,
        id: generateId(),
        slug: `${source.slug}-copia`,
        title: `${source.title} (copia)`,
        status: ACTIVITY_STATUS.draft,
        version: 1,
        updatedAt: new Date().toISOString().slice(0, 10),
        objectives: [...(source.objectives ?? [])],
        rubric: [],
      };
      setActivities((current) => [copy, ...current]);
      setConversations((current) => ({ ...current, [copy.id]: [] }));
      return copy;
    },
    [activities],
  );

  const removeActivity = useCallback((id) => {
    setActivities((current) => current.filter((activity) => activity.id !== id));
    setConversations((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }, []);

  const togglePublish = useCallback(
    (id) => {
      const target = activities.find((activity) => activity.id === id);
      if (!target) return;
      const nextStatus =
        target.status === ACTIVITY_STATUS.published ? ACTIVITY_STATUS.draft : ACTIVITY_STATUS.published;
      setActivities((current) =>
        current.map((activity) =>
          activity.id === id
            ? {
                ...activity,
                status: nextStatus,
                version: activity.version + 1,
                updatedAt: new Date().toISOString().slice(0, 10),
              }
            : activity,
        ),
      );
    },
    [activities],
  );

  const resetDemo = useCallback(() => {
    setActivities(ACTIVITIES.map((activity) => ({ ...activity })));
    setConversations({ ...DEMO_CONVERSATIONS });
  }, []);

  const value = useMemo(
    () => ({
      isDemo: true,
      notice: DEMO_NOTICE,
      student: DEMO_STUDENT,
      teacher: DEMO_TEACHER,
      students: DEMO_STUDENTS,
      studentActivityState: STUDENT_ACTIVITY_STATE,
      results,
      featuredActivityId: FEATURED_ACTIVITY_ID,
      activities,
      publishedActivities: activities.filter(
        (activity) => activity.status === ACTIVITY_STATUS.published,
      ),
      conversations,
      getActivity,
      getConversation: (id) => conversations[id] ?? [],
      getResult: (id) => results[id] ?? null,
      createActivity,
      updateActivity,
      duplicateActivity,
      removeActivity,
      togglePublish,
      resetDemo,
    }),
    [
      activities,
      conversations,
      results,
      getActivity,
      createActivity,
      updateActivity,
      duplicateActivity,
      removeActivity,
      togglePublish,
      resetDemo,
    ],
  );

  return <DemoWorkspaceContext.Provider value={value}>{children}</DemoWorkspaceContext.Provider>;
}

export function useDemoWorkspace() {
  const context = useContext(DemoWorkspaceContext);
  if (!context) {
    throw new Error('useDemoWorkspace debe usarse dentro de DemoWorkspaceProvider.');
  }
  return context;
}
