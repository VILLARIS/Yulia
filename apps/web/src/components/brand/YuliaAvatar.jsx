import yuliaAvatar from '../../assets/yulia/avatar-yulia.png';

/**
 * Tamaños disponibles. La ilustración es cuadrada y ocupa casi todo el lienzo,
 * así que se muestra siempre con `contain`: nunca se recorta ni se deforma.
 */
const SIZES = {
  xs: 'size-7',
  sm: 'size-9',
  md: 'size-12',
  lg: 'size-16',
};

const DESCRIPTIVE_ALT =
  'Yulia, guía de la plataforma, que acompaña la conversación de práctica sin marcar respuestas.';

/**
 * Avatar de Yulia.
 *
 * Por defecto es decorativo (`alt=""`) porque casi siempre acompaña a un texto
 * que ya la identifica, como la etiqueta «Simulador» o el nombre de la sección.
 * Cuando la imagen es la única referencia a la identidad hay que pasar
 * `decorative={false}` para que el enlace de voz la describa.
 *
 * `fluid` delega el tamaño en las clases de `className`, para los casos en que
 * la imagen debe ocupar el ancho disponible. Sin él se aplica siempre un tamaño
 * cuadrado de la tabla, que es el que mantiene la ilustración sin deformar.
 */
export function YuliaAvatar({
  size = 'sm',
  fluid = false,
  decorative = true,
  priority = false,
  className = '',
}) {
  const sizing = fluid ? '' : SIZES[size] ?? SIZES.sm;

  return (
    <img
      src={yuliaAvatar}
      alt={decorative ? '' : DESCRIPTIVE_ALT}
      className={`shrink-0 rounded-lg object-contain ${sizing} ${className}`}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}
