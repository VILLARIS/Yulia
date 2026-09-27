const MONTHS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

/** Formatea una fecha ISO (`2026-02-20`) como `20 feb 2026`. */
export function formatDate(iso) {
  if (!iso) return null;
  const [year, month, day] = String(iso).split('-').map(Number);
  if (!year || !month || !day) return null;
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export function formatDateTime(value) {
  if (!value) return null;
  return String(value).replace('T', ' ');
}

/** Convierte un texto en un identificador legible para URLs y anclas. */
export function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Cuenta palabras de un texto largo para mostrarlo en las fichas. */
export function countWords(value) {
  const text = String(value ?? '').trim();
  if (!text) return 0;
  return text.split(/\s+/).length;
}

/** Trunca un texto largo para las vistas resumidas, sin cortar palabras. */
export function truncate(value, maxLength = 180) {
  const text = String(value ?? '').trim();
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}
