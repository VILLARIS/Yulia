/**
 * Renderizador de contenido estructurado para respuestas largas.
 *
 * Sustento deliberadamente un subconjunto acotado de marcas (párrafos, listas,
 * títulos y énfasis) en lugar de un parser Markdown completo. Al no usar
 * `dangerouslySetInnerHTML`, el contenido se inserta siempre como nodos de texto
 * de React y no existe superficie de inyección.
 *
 * Este componente es el ÚNICO punto que habría que sustituir si en la fase
 * siguiente se decide integrar un renderizador Markdown con sanitización.
 */

const INLINE_PATTERN = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/g;

function renderInline(text, keyPrefix) {
  return text
    .split(INLINE_PATTERN)
    .filter((part) => part !== '' && part !== undefined)
    .map((part, index) => {
      const key = `${keyPrefix}-${index}`;
      if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={key} className="font-semibold text-navy">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={key} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-navy">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) {
        return <em key={key}>{part.slice(1, -1)}</em>;
      }
      return <span key={key}>{part}</span>;
    });
}

const BULLET_PATTERN = /^[-\u2022]\s+(.*)$/;

function renderBlock(block, key) {
  const lines = block.split('\n');

  const meaningful = lines.filter((line) => line.trim() !== '');
  if (meaningful.length === 0) return null;

  const isList = meaningful.every((line) => BULLET_PATTERN.test(line.trim()));
  if (isList) {
    return (
      <ul key={key} className="my-3 space-y-2 pl-1">
        {meaningful.map((line, index) => {
          const match = BULLET_PATTERN.exec(line.trim());
          return (
            <li key={`${key}-li-${index}`} className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-action" />
              <span className="min-w-0">{renderInline(match[1], `${key}-li-${index}`)}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  if (meaningful.length === 1 && /^###\s+/.test(meaningful[0].trim())) {
    return (
      <h4 key={key} className="mb-2 mt-4 text-base font-semibold text-navy first:mt-0">
        {renderInline(meaningful[0].trim().replace(/^###\s+/, ''), key)}
      </h4>
    );
  }

  if (meaningful.length === 1) {
    return (
      <p key={key} className="my-3 first:mt-0 last:mb-0">
        {renderInline(meaningful[0].trim(), key)}
      </p>
    );
  }

  return (
    <p key={key} className="my-3 first:mt-0 last:mb-0">
      {meaningful.map((line, index) => (
        <span key={`${key}-line-${index}`}>
          {index > 0 ? <br /> : null}
          {renderInline(line.trim(), `${key}-line-${index}`)}
        </span>
      ))}
    </p>
  );
}

export function RichText({ content, className = '' }) {
  const blocks = String(content ?? '')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) return null;

  return (
    <div className={`text-[0.975rem] leading-7 text-slate-700 ${className}`}>
      {blocks.map((block, index) => renderBlock(block, `b${index}`))}
    </div>
  );
}
