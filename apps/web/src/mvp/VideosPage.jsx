import { useMemo, useState } from 'react';
import {
  ArrowRight, Apple, Brain, CalendarDays, Clock, FlaskConical, HeartPulse,
  Microscope, Play, Salad, Search, Tag,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

/* Fuente única del catálogo. Se deja vacía a propósito: todavía no existe
 * contenido real ni categorías en los datos, así que no se inventan títulos,
 * duraciones, autores ni métricas. Al conectar videos, basta con llenar esta
 * lista respetando los campos que se renderizan más abajo. */
const VIDEOS = [];

/* Tono e ilustración deterministas por posición, igual que en CourseCard. */
const TONE_CLASSES = ['video-tone-green', 'video-tone-blue', 'video-tone-cream', 'video-tone-teal'];
const ART_ICONS = [FlaskConical, Apple, Microscope, Brain, Salad, HeartPulse];

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'bromatologia', label: 'Bromatología' },
  { key: 'nutricion', label: 'Nutrición' },
  { key: 'bioquimica', label: 'Bioquímica' },
];

function VideoMeta({ video, className }) {
  const items = [];
  if (video.duration) items.push(<span key="duration"><Clock size={13} aria-hidden="true" />{video.duration}</span>);
  if (video.topic) items.push(<span key="topic"><Tag size={13} aria-hidden="true" />{video.topic}</span>);
  if (video.date) items.push(<span key="date"><CalendarDays size={13} aria-hidden="true" />{video.date}</span>);
  if (!items.length) return null;
  return <p className={className}>{items}</p>;
}

function VideoThumb({ video, index, featured = false }) {
  const Icon = ART_ICONS[index % ART_ICONS.length];
  const tone = TONE_CLASSES[index % TONE_CLASSES.length];
  const className = `video-thumb ${tone} ${featured ? 'video-thumb-featured' : ''}`;

  const content = (
    <>
      {video.thumbnail ? (
        <img src={video.thumbnail} alt="" loading="lazy" className="video-thumb-img" />
      ) : (
        <>
          <span className="video-thumb-orb" aria-hidden="true" />
          <Icon className="video-thumb-art" size={featured ? 64 : 46} strokeWidth={1.2} aria-hidden="true" />
        </>
      )}
      <span className="video-play" aria-hidden="true">
        <Play size={featured ? 22 : 18} fill="currentColor" />
      </span>
      {video.duration ? <span className="video-duration">{video.duration}</span> : null}
    </>
  );

  if (!video.url) return <div className={className}>{content}</div>;

  return (
    <a
      className={className}
      href={video.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`Ver video: ${video.title}`}
    >
      {content}
    </a>
  );
}

function VideoCard({ video, index }) {
  return (
    <article className="video-card">
      <VideoThumb video={video} index={index} />
      <div className="video-card-body">
        <span className="video-card-label">Video</span>
        <h2 className="video-card-title line-clamp-2">{video.title}</h2>
        {video.description ? <p className="video-card-desc line-clamp-3">{video.description}</p> : null}
        <VideoMeta video={video} className="video-meta" />
        {video.url ? (
          <a className="video-cta" href={video.url} target="_blank" rel="noreferrer">
            Ver video <ArrowRight size={15} aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </article>
  );
}

function FeaturedVideo({ video }) {
  return (
    <article className="video-featured">
      <VideoThumb video={video} index={0} featured />
      <div className="video-featured-body">
        <span className="video-featured-label">Destacado</span>
        <h2 className="video-featured-title">{video.title}</h2>
        {video.description ? <p className="video-featured-desc">{video.description}</p> : null}
        <VideoMeta video={video} className="video-meta" />
        {video.url ? (
          <a className="video-featured-cta" href={video.url} target="_blank" rel="noreferrer">
            <Play size={16} aria-hidden="true" /> Ver video
          </a>
        ) : null}
      </div>
    </article>
  );
}

function EmptyArt() {
  return (
    <div className="videos-empty-art" aria-hidden="true">
      <span className="videos-empty-glow" />
      <span className="videos-empty-ring" />
      <span className="videos-empty-play">
        <Play size={22} fill="currentColor" />
      </span>
      <FlaskConical className="videos-empty-icon videos-empty-icon-a" size={22} strokeWidth={1.5} />
      <Apple className="videos-empty-icon videos-empty-icon-b" size={20} strokeWidth={1.5} />
      <Microscope className="videos-empty-icon videos-empty-icon-c" size={22} strokeWidth={1.5} />
    </div>
  );
}

function VideosEmpty() {
  return (
    <div className="videos-empty">
      <EmptyArt />
      <p className="videos-empty-eyebrow">Contenido en preparación</p>
      <h2 className="videos-empty-title">Próximamente encontrarás videos educativos aquí</h2>
      <p className="videos-empty-text">
        Estamos preparando contenido breve para reforzar temas de bromatología, nutrición y bioquímica.
      </p>
    </div>
  );
}

export function VideosPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const hasVideos = VIDEOS.length > 0;
  const hasCategories = VIDEOS.some((video) => Boolean(video.category));
  const term = query.trim().toLowerCase();

  const visible = useMemo(() => VIDEOS.filter((video) => {
    const matchesTerm = !term
      || video.title.toLowerCase().includes(term)
      || (video.description ?? '').toLowerCase().includes(term);
    const matchesFilter = filter === 'all' || video.category === filter;
    return matchesTerm && matchesFilter;
  }), [term, filter]);

  const showFeatured = hasVideos && filter === 'all' && !term;
  const featured = showFeatured ? visible[0] : null;
  const gridVideos = featured ? visible.slice(1) : visible;
  const resetFilters = () => { setQuery(''); setFilter('all'); };

  return (
    <div className="videos-page">
      <section className="courses-header videos-header">
        <div className="site-container">
          <p className="courses-eyebrow">Aprende a tu ritmo</p>
          <h1 className="courses-title">Videos educativos</h1>
          <p className="courses-subtitle">
            Contenido breve sobre bromatología, nutrición y bioquímica para reforzar lo aprendido de forma clara y práctica.
          </p>
          {hasVideos ? (
            <p className="courses-count">{VIDEOS.length} {VIDEOS.length === 1 ? 'video' : 'videos'}</p>
          ) : null}
        </div>
      </section>

      <section className="courses-main">
        <div className="site-container">
          <div className="courses-toolbar">
            <div className="courses-search">
              <Search size={18} aria-hidden="true" className="courses-search-icon" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar videos"
                aria-label="Buscar videos"
                className="courses-search-input"
              />
            </div>
            <div className="courses-filters" role="group" aria-label="Filtrar videos por categoría">
              {FILTERS.map(({ key, label }) => {
                const disabled = !hasCategories && key !== 'all';
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={disabled}
                    aria-pressed={filter === key}
                    onClick={() => setFilter(key)}
                    title={disabled ? 'Disponible cuando los videos estén clasificados' : undefined}
                    className={`courses-filter ${filter === key ? 'courses-filter-active' : ''} ${disabled ? 'videos-filter-disabled' : ''}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {!hasCategories ? (
            <p className="videos-filter-note">
              Las categorías se activarán cuando el catálogo tenga videos clasificados.
            </p>
          ) : null}

          {!hasVideos ? <VideosEmpty /> : null}

          {hasVideos && visible.length === 0 ? (
            <div className="videos-empty videos-empty-compact">
              <span className="videos-empty-search" aria-hidden="true"><Search size={22} /></span>
              <h2 className="videos-empty-title">No encontramos videos</h2>
              <p className="videos-empty-text">Prueba con otra búsqueda o cambia el filtro.</p>
              <div className="videos-empty-action">
                <Button variant="secondary" onClick={resetFilters}>Limpiar filtros</Button>
              </div>
            </div>
          ) : null}

          {hasVideos && visible.length > 0 ? (
            <>
              {featured ? <FeaturedVideo video={featured} /> : null}
              {gridVideos.length > 0 ? (
                <ul className="courses-grid">
                  {gridVideos.map((video, index) => (
                    <li key={video.id ?? video.title}>
                      <VideoCard video={video} index={featured ? index + 1 : index} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
