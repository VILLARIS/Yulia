/**
 * Smoke test de render del frontend.
 *
 * Renderiza cada ruta relevante con `react-dom/server` y `MemoryRouter`, sin
 * necesidad de un navegador. Existe para detectar errores de runtime que la
 * compilación no puede ver, como el de una pantalla en blanco por una llamada
 * incorrecta a `matchPath`.
 *
 * Falla si alguna ruta lanza una excepción, si no produce exactamente un `<h1>`,
 * si la navegación corresponde a otro espacio o si se filtra `undefined`,
 * `NaN` u `[object Object]` en el texto visible.
 *
 * Uso: pnpm --filter @bioquimica/web test:smoke
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createElement } from 'react';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(scriptDir, '..');

/** Rutas a comprobar y espacio que debe resolver `resolveSpace` para cada una. */
const ROUTES = [
  { path: '/', space: 'public' },
  { path: '/acceso', space: 'public' },
  { path: '/registro', space: 'public' },
  { path: '/recuperar-contrasena', space: 'public' },
  { path: '/simulaciones', space: 'public' },
  { path: '/simulaciones/act-glucosa-ayuno', space: 'public' },
  { path: '/simulaciones/act-glucosa-ayuno/simular', space: 'public' },
  { path: '/simulaciones/no-existe', space: 'public' },
  { path: '/estudiante', space: 'student' },
  { path: '/estudiante/actividades', space: 'student' },
  { path: '/estudiante/actividades/act-glucosa-ayuno', space: 'student' },
  { path: '/estudiante/perfil', space: 'student' },
  { path: '/resultados/act-vitamina-d', space: 'student' },
  { path: '/resultados/no-existe', space: 'student' },
  { path: '/docente', space: 'teacher' },
  { path: '/docente/actividades', space: 'teacher' },
  { path: '/docente/actividades/nueva', space: 'teacher' },
  { path: '/docente/actividades/act-glucosa-ayuno/editar', space: 'teacher' },
  { path: '/docente/actividades/no-existe/editar', space: 'teacher' },
  { path: '/docente/estudiantes', space: 'teacher' },
  { path: '/docente/seguimiento', space: 'teacher' },
  { path: '/docente/resultados', space: 'teacher' },
  { path: '/ruta-inexistente', space: 'public' },
];

/**
 * Etiquetas que solo existen en la navegación de un espacio. Se buscan dentro
 * del `<header>` para no confundirlas con los enlaces homónimos del pie de página.
 */
const SPACE_MARKERS = {
  public: ['>Inicio<', '>Simulaciones<'],
  student: ['>Mi aprendizaje<', '>Perfil<'],
  teacher: ['>Panel<', '>Seguimiento<'],
};

const LEAKS = ['undefined', 'NaN', '[object Object]'];

function visibleText(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countTag(html, tag) {
  return (html.match(new RegExp(`<${tag}[\\s>]`, 'g')) ?? []).length;
}

/** Revisa una ruta y devuelve la lista de problemas encontrados. */
function checkRoute(html, expectedSpace) {
  const problems = [];

  const headings = countTag(html, 'h1');
  if (headings === 0) problems.push('no renderiza ningún <h1>');
  if (headings > 1) problems.push(`renderiza ${headings} <h1> (se esperaba 1)`);

  const text = visibleText(html);
  for (const leak of LEAKS) {
    if (text.includes(leak)) problems.push(`el texto visible contiene "${leak}"`);
  }

  const header = (html.match(/<header[\s\S]*?<\/header>/) ?? [''])[0];
  if (!header) {
    problems.push('no renderiza el encabezado de la aplicación');
  } else {
    const markers = SPACE_MARKERS[expectedSpace];
    const missing = markers.filter((marker) => !header.includes(marker));
    if (missing.length > 0) {
      problems.push(
        `la navegación no corresponde al espacio "${expectedSpace}" (faltan ${missing.join(', ')})`,
      );
    }
    if (!header.includes('aria-controls="navegacion-movil"') || !header.includes('aria-expanded=')) {
      problems.push('el botón del menú móvil no declara aria-controls/aria-expanded');
    }
  }

  return problems;
}

async function main() {
  const server = await createServer({
    root: webRoot,
    configFile: path.join(webRoot, 'vite.config.js'),
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  });

  let App;
  try {
    ({ App } = await server.ssrLoadModule('/src/App.jsx'));
  } catch (error) {
    console.error('No se pudo cargar la aplicación:', error);
    await server.close();
    process.exit(1);
  }

  // `MemoryRouter` usa `useLayoutEffect`, que no existe en el renderizado a
  // cadena. El aviso es esperado y no indica un problema de la aplicación.
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('useLayoutEffect')) return;
    originalError(...args);
  };

  const failures = [];
  let rendered = 0;

  for (const { path: routePath, space } of ROUTES) {
    let html;
    try {
      html = renderToString(
        createElement(MemoryRouter, { initialEntries: [routePath] }, createElement(App)),
      );
    } catch (error) {
      failures.push({ routePath, space, problems: [`lanza ${error.name}: ${error.message}`] });
      console.log(`FALLA  ${routePath}`);
      console.log(`       ${error.name}: ${error.message}`);
      continue;
    }

    const problems = checkRoute(html, space);
    if (problems.length > 0) {
      failures.push({ routePath, space, problems });
      console.log(`FALLA  ${routePath}`);
      for (const problem of problems) console.log(`       - ${problem}`);
      continue;
    }

    rendered += 1;
    console.log(`OK     ${routePath}  [${space}]`);
  }

  console.error = originalError;
  await server.close();

  console.log('');
  console.log(`Rutas renderizadas correctamente: ${rendered}/${ROUTES.length}`);

  if (failures.length > 0) {
    console.log(`Rutas con problemas: ${failures.length}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
