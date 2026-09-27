import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, FlaskConical } from 'lucide-react';
import { APP_ROUTES, buildPath } from '@bioquimica/shared/routes';
import { LEVEL_LABELS } from '../../data/demoData';
import { formatDate } from '../../utils/format';
import { StatusBadge } from '../ui/StatusBadge';

const OVERRIDE_VARIANT = { in_progress: 'info', completed: 'success', not_started: 'neutral' };
const OVERRIDE_LABEL = { in_progress: 'En curso', completed: 'Finalizada', not_started: 'Sin iniciar' };

/**
 * Tarjeta de actividad. `statusOverride` permite que el espacio estudiante
 * muestre su propio estado (en curso, finalizada). En las vistas públicas no se
 * muestra el estado editorial: el catálogo solo ofrece actividades publicadas, así
 * que la etiqueta «Publicada» no aportaría información.
 * `level` debe ser un nombre de elemento en mayúscula (`level: Level`) para que
 * JSX lo interprete como encabezado y no como una etiqueta HTML desconocida.
 */
export function ActivityCard({ activity, statusOverride, to, actionLabel = 'Ver detalle', footer, level: Level = 'h3' }) {
  const statusVariant = OVERRIDE_VARIANT[statusOverride];
  const statusLabel = OVERRIDE_LABEL[statusOverride];

  const target = to ?? buildPath(APP_ROUTES.activityDetail, { activityId: activity.id });

  return (
    <article className="flex h-full flex-col rounded-panel border border-slate-200 bg-white p-5 shadow-panel transition-shadow hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        {statusLabel ? (
          <StatusBadge variant={statusVariant} dot>
            {statusLabel}
          </StatusBadge>
        ) : null}
        {activity.difficulty ? (
          <StatusBadge variant="neutral">{LEVEL_LABELS[activity.difficulty] ?? activity.difficulty}</StatusBadge>
        ) : null}
      </div>

      <Level className="mt-4 text-lg font-semibold leading-7 text-navy">
        <Link
          to={target}
          className="rounded underline-offset-4 transition-colors hover:text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
        >
          {activity.title}
        </Link>
      </Level>

      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{activity.summary}</p>

      <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Área</dt>
          <FlaskConical size={13} aria-hidden="true" />
          <dd>{activity.subject}</dd>
        </div>
        {activity.updatedAt ? (
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Actualizada</dt>
            <Clock3 size={13} aria-hidden="true" />
            <dd>Actualizada el {formatDate(activity.updatedAt)}</dd>
          </div>
        ) : null}
      </dl>

      {footer ? (
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">{footer}</div>
      ) : (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <Link
            to={target}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-action underline-offset-4 transition-colors hover:text-action-strong hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
          >
            {actionLabel}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      )}
    </article>
  );
}
