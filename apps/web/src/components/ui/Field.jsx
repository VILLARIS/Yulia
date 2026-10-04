import { useId } from 'react';

/**
 * Envoltorio común de todos los campos. Centraliza la relación entre etiqueta,
 * texto de ayuda y error mediante ids, de modo que la tecnología asistiva siempre
 * reciba un nombre accesible y la descripción del error.
 */
function FieldShell({ id, label, hint, error, required, counter, children }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const counterId = counter ? `${id}-counter` : undefined;
  const describedBy = [hintId, errorId, counterId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-navy">
          {label}
          {required ? (
            <span className="ml-1 font-normal text-slate-500" aria-hidden="true">
              (obligatorio)
            </span>
          ) : null}
        </label>
        {counter ? (
          <span id={counterId} className="text-xs text-slate-500">
            {counter}
          </span>
        ) : null}
      </div>

      {hint ? (
        <p id={hintId} className="mt-1 text-sm leading-5 text-slate-600">
          {hint}
        </p>
      ) : null}

      <div className="mt-2">{children({ describedBy, invalid: Boolean(error) })}</div>

      {error ? (
        <p id={errorId} className="mt-2 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const CONTROL_BASE =
  'w-full rounded-lg border bg-white px-3 py-2.5 text-base text-navy placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';

const CONTROL_OK = 'border-slate-300 hover:border-slate-400';
const CONTROL_ERROR = 'border-red-400 bg-red-50/40';

/**
 * Campo de texto. `icon` sitúa un icono decorativo a la izquierda y adapta el
 * relleno para que el texto no quede debajo; el icono es `aria-hidden` y el
 * nombre accesible lo aporta siempre la etiqueta.
 */
export function TextField({ label, hint, error, required, icon: Icon, endAction, ...rest }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      {({ describedBy, invalid }) => {
        const input = (
          <input
            id={id}
            type="text"
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            className={`${CONTROL_BASE} ${Icon ? 'pl-10' : ''} ${endAction ? 'pr-12' : ''} ${invalid ? CONTROL_ERROR : CONTROL_OK}`}
            {...rest}
          />
        );
        if (!Icon && !endAction) return input;
        return (
          <div className="relative">
            {Icon ? <Icon
              size={17}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            /> : null}
            {input}
            {endAction ? <div className="absolute inset-y-0 right-2 flex items-center">{endAction}</div> : null}
          </div>
        );
      }}
    </FieldShell>
  );
}

export function TextAreaField({ label, hint, error, required, rows = 5, counter, ...rest }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} counter={counter}>
      {({ describedBy, invalid }) => (
        <textarea
          id={id}
          rows={rows}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={`${CONTROL_BASE} resize-y leading-6 ${invalid ? CONTROL_ERROR : CONTROL_OK}`}
          {...rest}
        />
      )}
    </FieldShell>
  );
}

export function SelectField({ label, hint, error, required, options, placeholder, ...rest }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      {({ describedBy, invalid }) => (
        <select
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={`${CONTROL_BASE} appearance-none bg-[length:1rem] pr-9 ${invalid ? CONTROL_ERROR : CONTROL_OK}`}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2364748b'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.19l3.71-3.96a.75.75 0 111.08 1.04l-4.25 4.53a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
          }}
          {...rest}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

export function CheckboxField({ label, hint, error, ...rest }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="min-w-0">
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className="mt-1 size-5 shrink-0 rounded border-slate-300 text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-1"
          {...rest}
        />
        <label htmlFor={id} className="text-sm font-medium leading-6 text-navy">
          {label}
        </label>
      </div>
      {hint ? (
        <p id={hintId} className="mt-1 pl-8 text-sm leading-5 text-slate-600">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1 pl-8 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
