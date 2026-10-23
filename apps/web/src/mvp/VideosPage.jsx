import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Apple, ArrowRight, Brain, CalendarDays, FlaskConical, HeartPulse, Microscope, Pencil,
  Play, Plus, Salad, Search,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Message } from '../components/ui/Message';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api } from './api';
import { useAuth } from './AuthContext';
import { youtubeThumbnail } from './youtube';

const TONE_CLASSES = ['video-tone-green', 'video-tone-blue', 'video-tone-cream', 'video-tone-teal'];
const ART_ICONS = [FlaskConical, Apple, Microscope, Brain, Salad, HeartPulse];

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'bromatologia', label: 'Bromatología' },
  { key: 'nutricion', label: 'Nutrición' },
  { key: 'bioquimica', label: 'Bioquímica' },
];

const dateFormatter = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' });

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
}

function VideoMeta({ video, className }) {
  if (!video.date) return null;
  return (
    <p className={className}>
      <span><CalendarDays size={13} aria-hidden="true" />{video.date}</span>
    </p>
  );
}

function VideoThumb({ video, index, featured = false }) {
  const [failed, setFailed] = useState(false);
  const Icon = ART_ICONS[index % ART_ICONS.length];
  const tone = TONE_CLASSES[index % TONE_CLASSES.length];
  const className = `video-thumb ${tone} ${featured ? 'video-thumb-featured' : ''}`;
  const showImage = Boolean(video.thumbnail) && !failed;

  useEffect(() => {
    setFailed(false);
  }, [video.thumbnail]);

  const content = (
    <>
      {showImage ? (
        <img
          src={video.thumbnail}
          alt=""
          loading={featured ? 'eager' : 'lazy'}
          className="video-thumb-img"
          onError={() => setFailed(true)}
        />
      ) : (
        <>
          <span className="video-thumb-orb" aria-hidden="true" />
          <Icon className="video-thumb-art" size={featured ? 64 : 46} strokeWidth={1.2} aria-hidden="true" />
        </>
      )}
      <span className="video-play" aria-hidden="true">
        <Play size={featured ? 22 : 18} fill="currentColor" />
      </span>
    </>
  );

  if (!video.href) return <div className={className}>{content}</div>;

  return (
    <Link className={className} to={video.href} aria-label={`Ver video: ${video.title}`}>
      {content}
    </Link>
  );
}

function VideoCard({ video, index, isTeacher }) {
  return (
    <article className="video-card">
      <VideoThumb video={video} index={index} />
      <div className="video-card-body">
        <div className="video-card-top">
          {isTeacher ? (
            <StatusBadge variant={video.published ? 'success' : 'warning'} dot>
              {video.published ? 'Publicado' : 'Borrador'}
            </StatusBadge>
          ) : (
            <span className="video-card-label">Video</span>
          )}
          {isTeacher ? (
            <Link to={`/docente/videos/${video.id}/editar`} className="video-edit-link">
              <Pencil size={13} aria-hidden="true" /> Editar
            </Link>
          ) : null}
        </div>
        <h2 className="video-card-title line-clamp-2">{video.title}</h2>
        {video.description ? <p className="video-card-desc line-clamp-3">{video.description}</p> : null}
        <VideoMeta video={video} className="video-meta" />
        <Link className="video-cta" to={video.href}>
          Ver video <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

function FeaturedVideo({ video, isTeacher }) {
  return (
    <article className="video-featured">
      <VideoThumb video={video} index={0} featured />
      <div className="video-featured-body">
        <div className="video-featured-top">
          {isTeacher ? (
            <StatusBadge variant={video.published ? 'success' : 'warning'} dot>
              {video.published ? 'Publicado' : 'Borrador'}
            </StatusBadge>
          ) : (
            <span className="video-featured-label">Destacado</span>
          )}
          {isTeacher ? (
            <Link to={`/docente/videos/${video.id}/editar`} className="video-edit-link">
              <Pencil size={13} aria-hidden="true" /> Editar
            </Link>
          ) : null}
        </div>
        <h2 className="video-featured-title">{video.title}</h2>
        {video.description ? <p className="video-featured-desc">{video.description}</p> : null}
        <VideoMeta video={video} className="video-meta" />
        <Link className="video-featured-cta" to={video.href}>
          <Play size={16} aria-hidden="true" /> Ver video
        </Link>
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

function VideosEmpty({ teacher }) {
  return (
    <div className="videos-empty">
      <EmptyArt />
      <p className="videos-empty-eyebrow">{teacher ? 'Tu catálogo' : 'Contenido en preparación'}</p>
      <h2 className="videos-empty-title">
        {teacher ? 'No has añadido videos todavía' : 'Próximamente encontrarás videos educativos aquí'}
      </h2>
      <p className="videos-empty-text">
        {teacher
          ? 'Comparte tu primer video de YouTube y publícalo cuando esté listo.'
          : 'Estamos preparando contenido breve para reforzar temas de bromatología, nutrición y bioquímica.'}
      </p>
      {teacher ? (
        <div className="videos-empty-action">
          <Button to="/docente/videos/nuevo" icon={Plus}>Añadir primer video</Button>
        </div>
      ) : null}
    </div>
  );
}

export function VideosPage() {
  const { user, loading: authLoading } = useAuth();
  const teacher = user?.role === 'teacher';
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (authLoading) return undefined;
    let active = true;
    setLoading(true);
    setError('');
    api('/videos').then(({ videos: data }) => {
      if (active) setVideos(data);
    }).catch((cause) => {
      if (active) setError(cause.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [authLoading, user?.id]);

  const items = useMemo(() => videos.map((video) => ({
    ...video,
    href: `/videos/${video.id}`,
    thumbnail: youtubeThumbnail(video.youtubeVideoId),
    date: formatDate(video.createdAt),
  })), [videos]);

  const hasVideos = items.length > 0;
  const hasCategories = items.some((video) => Boolean(video.category));
  const term = query.trim().toLowerCase();

  const visible = useMemo(() => items.filter((video) => {
    const matchesTerm = !term
      || video.title.toLowerCase().includes(term)
      || (video.description ?? '').toLowerCase().includes(term);
    const matchesFilter = filter === 'all' || video.category === filter;
    return matchesTerm && matchesFilter;
  }), [items, term, filter]);

  const showFeatured = hasVideos && filter === 'all' && !term;
  const featured = showFeatured ? visible[0] : null;
  const gridVideos = featured ? visible.slice(1) : visible;
  const resetFilters = () => { setQuery(''); setFilter('all'); };

  return (
    <div className="videos-page">
      <section className="courses-header videos-header">
        <div className="site-container">
          <div className="videos-header-row">
            <div className="videos-header-copy">
              <p className="courses-eyebrow">Aprende a tu ritmo</p>
              <h1 className="courses-title">Videos educativos</h1>
              <p className="courses-subtitle">
                Contenido breve sobre bromatología, nutrición y bioquímica para reforzar lo aprendido de forma clara y práctica.
              </p>
              {!loading && !error && hasVideos ? (
                <p className="courses-count">{items.length} {items.length === 1 ? 'video' : 'videos'}</p>
              ) : null}
            </div>
            {teacher ? (
              <Button to="/docente/videos/nuevo" icon={Plus} className="videos-add">
                Añadir video
              </Button>
            ) : null}
          </div>
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

          {loading ? (
            <div className="courses-grid" aria-hidden="true">
              <p className="sr-only" role="status">Cargando videos…</p>
              {[0, 1, 2].map((index) => (
                <div key={index} className="video-card course-card-skeleton" />
              ))}
            </div>
          ) : null}

          {error ? <Message tone="error">{error}</Message> : null}

          {!loading && !error && !hasVideos ? <VideosEmpty teacher={teacher} /> : null}

          {!loading && !error && hasVideos && visible.length === 0 ? (
            <div className="videos-empty videos-empty-compact">
              <span className="videos-empty-search" aria-hidden="true"><Search size={22} /></span>
              <h2 className="videos-empty-title">No encontramos videos</h2>
              <p className="videos-empty-text">Prueba con otra búsqueda o cambia el filtro.</p>
              <div className="videos-empty-action">
                <Button variant="secondary" onClick={resetFilters}>Limpiar filtros</Button>
              </div>
            </div>
          ) : null}

          {!loading && !error && visible.length > 0 ? (
            <>
              {featured ? <FeaturedVideo video={featured} isTeacher={teacher} /> : null}
              {gridVideos.length > 0 ? (
                <ul className="courses-grid">
                  {gridVideos.map((video, index) => (
                    <li key={video.id}>
                      <VideoCard video={video} index={featured ? index + 1 : index} isTeacher={teacher} />
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
