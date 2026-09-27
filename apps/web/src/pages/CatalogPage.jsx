import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { APP_ROUTES } from '@bioquimica/shared/routes';
import { PageHeader } from '../components/layout/PageHeader';
import { Section } from '../components/layout/Section';
import { ActivityCard } from '../components/activity/ActivityCard';
import { Button } from '../components/ui/Button';
import { DemoNotice } from '../components/ui/DemoNotice';
import { EmptyState } from '../components/ui/EmptyState';
import { SelectField, TextField } from '../components/ui/Field';
import { Tabs } from '../components/ui/Tabs';
import { useDemoWorkspace } from '../context/DemoWorkspaceContext';
import { LEVEL_LABELS, SUBJECT_AREAS } from '../data/demoData';

export function CatalogPage() {
  const { publishedActivities, notice } = useDemoWorkspace();
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('all');
  const [level, setLevel] = useState('all');

  useEffect(() => {
    document.title = 'Catálogo de simulaciones · Bioquímica Nutricional';
  }, []);

  const availableSubjects = useMemo(
    () => SUBJECT_AREAS.filter((area) => publishedActivities.some((activity) => activity.subject === area.value)),
    [publishedActivities],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return publishedActivities.filter((activity) => {
      if (subject !== 'all' && activity.subject !== subject) return false;
      if (level !== 'all' && activity.difficulty !== level) return false;
      if (!normalized) return true;
      return [activity.title, activity.summary, activity.topic, activity.scenario]
        .join(' ')
        .toLowerCase()
        .includes(normalized);
    });
  }, [publishedActivities, query, subject, level]);

  const hasFilters = query.trim() !== '' || subject !== 'all' || level !== 'all';

  const clearFilters = () => {
    setQuery('');
    setSubject('all');
    setLevel('all');
  };

  return (
    <>
      <PageHeader
        title="Catálogo de simulaciones"
        description="Escenarios publicados por el profesorado. Cada ficha describe el caso y el razonamiento que se practica."
        breadcrumbs={[{ label: 'Inicio', to: APP_ROUTES.home }, { label: 'Simulaciones' }]}
      />

      <Section>
        <DemoNotice {...notice} className="mb-8" />

        <div className="grid gap-4 rounded-panel border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          <TextField
            label="Buscar en el catálogo"
            type="search"
            icon={Search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tema, título o palabra clave"
          />

          <SelectField
            label="Área"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            options={[
              { value: 'all', label: 'Todas las áreas' },
              ...availableSubjects,
            ]}
          />

          <SelectField
            label="Nivel"
            value={level}
            onChange={(event) => setLevel(event.target.value)}
            options={[
              { value: 'all', label: 'Todos los niveles' },
              ...Object.entries(LEVEL_LABELS).map(([value, optionLabel]) => ({
                value,
                label: optionLabel,
              })),
            ]}
          />
        </div>

        <p className="mt-5 text-sm text-slate-600" role="status">
          {filtered.length === 1
            ? '1 actividad coincide con los filtros aplicados.'
            : `${filtered.length} actividades coinciden con los filtros aplicados.`}
        </p>

        {filtered.length > 0 ? (
          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                actionLabel="Ver el escenario"
                level="h2"
              />
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              icon={BookOpen}
              title={hasFilters ? 'Ninguna actividad coincide' : 'El catálogo está vacío'}
              description={
                hasFilters
                  ? 'Prueba a cambiar el texto de búsqueda o a quitar alguno de los filtros.'
                  : 'Todavía no hay actividades publicadas. El profesorado puede publicarlas desde su espacio.'
              }
              action={
                hasFilters ? (
                  <Button variant="secondary" onClick={clearFilters}>
                    Quitar filtros
                  </Button>
                ) : (
                  <Button to={APP_ROUTES.teacherActivities} variant="secondary">
                    Ir a gestión de actividades
                  </Button>
                )
              }
            />
          </div>
        )}
      </Section>

      <Section className="border-t border-slate-200 bg-white">
        <h2 className="text-2xl font-semibold tracking-tight text-navy">Cómo se organiza el catálogo</h2>
        <Tabs
          ariaLabel="Criterios del catálogo"
          tabs={[
            { id: 'publicacion', label: 'Publicación' },
            { id: 'contenido', label: 'Contenido' },
            { id: 'seguimiento', label: 'Seguimiento' },
          ]}
        >
          {(activeId) => (
            <div className="max-w-3xl text-sm leading-7 text-slate-600">
              {activeId === 'publicacion' ? (
                <p>
                  Una actividad pasa a formar parte del catálogo cuando el profesorado la publica.
                  Las que siguen en borrador solo son visibles desde el espacio docente, lo que
                  permite revisar el escenario y el prompt antes de que nadie lo practice.
                </p>
              ) : null}
              {activeId === 'contenido' ? (
                <p>
                  Cada ficha incluye un escenario, un reto de razonamiento, los objetivos que la
                  docente considera relevantes y las instrucciones de tutoría. Ninguna de esas
                  piezas impone una estructura rígida: el simulador reproduce lo que la docente
                  haya escrito.
                </p>
              ) : null}
              {activeId === 'seguimiento' ? (
                <p>
                  El espacio docente permite revisar el avance de cada estudiante en cada
                  actividad. Esas señales sirven para orientar la tutoría; no producen notas ni
                  reducciones automáticas de puntuación.
                </p>
              ) : null}
            </div>
          )}
        </Tabs>
      </Section>
    </>
  );
}
