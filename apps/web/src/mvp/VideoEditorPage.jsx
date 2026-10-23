import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Eye, Lightbulb, Link2, Play, Save, Trash2, Video,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TextAreaField, TextField } from '../components/ui/Field';
import { FieldHelp } from '../components/ui/FieldHelp';
import { Message } from '../components/ui/Message';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api, deleteVideo } from './api';
import { parseYouTubeUrl, youtubeThumbnail } from './youtube';

const HELP = {
  title: {
    text: 'Escribe un nombre breve que describa el contenido del video.',
    example: 'Interpretación del perfil lipídico',
    avoid: "Títulos genéricos como 'Video 1'.",
  },
  description: {
    text: 'Explica qué aprenderá el estudiante y qué temas se tratan.',
    example: 'Repaso de LDL, HDL y triglicéridos con un caso práctico.',
    avoid: 'Repetir únicamente el título.',
  },
  youtubeUrl: {
    text: 'Pega el enlace del video publicado en YouTube. Se aceptan enlaces normales, cortos y de Shorts.',
    example: 'https://www.youtube.com/watch?v=… o https://youtu.be/…',
    avoid: 'Enlaces de listas de reproducción, archivos locales o servicios distintos de YouTube.',
  },
  visibility: {
    text: 'Controla si los estudiantes pueden encontrar y abrir este video.',
    example: 'Déjalo como borrador mientras revisas el contenido y publícalo cuando esté listo.',
  },
};

export function VideoEditorPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState({ title: '', description: '', youtubeUrl: '', published: false });
  const [loading, setLoading] = useState(Boolean(videoId));
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [previewFailed, setPreviewFailed] = useState(false);
  const previewId = parseYouTubeUrl(values.youtubeUrl);

  useEffect(() => {
    setPreviewFailed(false);
  }, [previewId]);

  useEffect(() => {
    if (!videoId) return undefined;
    let active = true;
    api(`/videos/${videoId}`).then(({ video }) => {
      if (!active) return;
      setValues({
        title: video.title,
        description: video.description ?? '',
        youtubeUrl: video.youtubeUrl,
        published: video.published,
      });
    }).catch((cause) => {
      if (active) setLoadError(cause.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [videoId]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { video } = await api(videoId ? `/videos/${videoId}` : '/videos', {
        method: videoId ? 'PATCH' : 'POST',
        body: JSON.stringify(values),
      });
      navigate(`/videos/${video.id}`);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  };

  const closeDelete = () => {
    if (deleteBusy) return;
    setConfirmOpen(false);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    setDeleteError('');
    try {
      await deleteVideo(videoId);
      setConfirmOpen(false);
      navigate('/videos');
    } catch (cause) {
      setDeleteError(cause.message);
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="courses-page editor-page">
      <section className="editor-hero">
        <div className="site-container">
          <nav className="editor-breadcrumb" aria-label="Ruta de navegación">
            <Link to="/docente" className="editor-breadcrumb-link">Panel docente</Link>
            <span className="editor-breadcrumb-sep" aria-hidden="true">/</span>
            <Link to="/videos" className="editor-breadcrumb-link">Videos</Link>
            <span className="editor-breadcrumb-sep" aria-hidden="true">/</span>
            <span className="editor-breadcrumb-current" aria-current="page">{videoId ? 'Editar video' : 'Nuevo video'}</span>
          </nav>
          <div className="editor-hero-row">
            <div className="min-w-0">
              <p className="editor-eyebrow">Panel docente</p>
              <h1 className="editor-title">{videoId ? 'Editar video' : 'Nuevo video'}</h1>
              <p className="editor-subtitle">Comparte un video de YouTube y decide cuándo estará disponible.</p>
            </div>
            <Link to="/videos" className="editor-back">
              <ArrowLeft size={15} aria-hidden="true" /> Volver a Videos
            </Link>
          </div>
        </div>
      </section>

      <section className="editor-main">
        <div className="site-container">
          {loading ? (
            <div className="editor-grid" aria-hidden="true">
              <p className="sr-only" role="status">Cargando video…</p>
              <div className="editor-form">
                <div className="editor-card editor-skeleton editor-skeleton-lg" />
                <div className="editor-card editor-skeleton editor-skeleton-sm" />
              </div>
              <div className="editor-aside">
                <div className="editor-card editor-skeleton editor-skeleton-sm" />
              </div>
            </div>
          ) : loadError ? (
            <div className="editor-card">
              <div className="editor-card-body">
                <Message tone="error">{loadError}</Message>
                <div>
                  <Button to="/videos" variant="secondary" icon={ArrowLeft}>Volver a Videos</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="editor-grid">
              <form onSubmit={submit} className="editor-form">
                {error ? <Message tone="error">{error}</Message> : null}

                <div className="editor-card">
                  <div className="editor-card-head">
                    <span className="editor-card-icon editor-card-icon-green" aria-hidden="true"><Video size={18} strokeWidth={1.9} /></span>
                    <div className="editor-card-headtext">
                      <h2 className="editor-card-title">Información del video</h2>
                      <p className="editor-card-sub">El contenido que verán los estudiantes en el catálogo.</p>
                    </div>
                  </div>
                  <div className="editor-card-body">
                    <TextField
                      label="Título"
                      help={<FieldHelp label="Título" {...HELP.title} />}
                      value={values.title}
                      onChange={(event) => setValues({ ...values, title: event.target.value })}
                      minLength={3}
                      maxLength={200}
                      placeholder="Ej. Interpretación del perfil lipídico"
                      required
                    />
                    <TextAreaField
                      label="Descripción"
                      help={<FieldHelp label="Descripción" {...HELP.description} />}
                      value={values.description}
                      onChange={(event) => setValues({ ...values, description: event.target.value })}
                      maxLength={5000}
                      rows={5}
                      hint="Resume el contenido y lo que aprenderá el estudiante."
                      counter={`${values.description.length}/5000`}
                      placeholder="Describe el tema y los puntos principales del video."
                    />
                    <div>
                      <TextField
                        label="Enlace de YouTube"
                        help={<FieldHelp label="Enlace de YouTube" {...HELP.youtubeUrl} />}
                        value={values.youtubeUrl}
                        onChange={(event) => setValues({ ...values, youtubeUrl: event.target.value })}
                        maxLength={2048}
                        inputMode="url"
                        autoComplete="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        hint="Acepta enlaces youtube.com/watch, youtu.be y youtube.com/shorts."
                        placeholder="https://www.youtube.com/watch?v=..."
                        required
                      />
                      {previewId ? (
                        <div className="video-preview">
                          <p className="video-preview-label">Vista previa</p>
                          <div className="video-preview-frame">
                            {previewFailed ? (
                              <span className="video-preview-fallback" aria-hidden="true">
                                <Play size={30} fill="currentColor" />
                              </span>
                            ) : (
                              <>
                                <img
                                  src={youtubeThumbnail(previewId)}
                                  alt=""
                                  className="video-preview-img"
                                  onError={() => setPreviewFailed(true)}
                                />
                                <span className="video-preview-play" aria-hidden="true">
                                  <Play size={18} fill="currentColor" />
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="editor-card">
                  <div className="editor-card-head">
                    <span className="editor-card-icon editor-card-icon-blue" aria-hidden="true"><Eye size={18} strokeWidth={1.9} /></span>
                    <div className="editor-card-headtext">
                      <div className="editor-card-title-row">
                        <h2 className="editor-card-title">Visibilidad</h2>
                        <FieldHelp label="Visibilidad" {...HELP.visibility} />
                      </div>
                      <p className="editor-card-sub">Controla si el video está disponible para los estudiantes.</p>
                    </div>
                  </div>
                  <div className="editor-card-body">
                    <label className="editor-switch">
                      <input
                        type="checkbox"
                        className="editor-switch-input"
                        checked={values.published}
                        onChange={(event) => setValues({ ...values, published: event.target.checked })}
                      />
                      <span className="editor-switch-track" aria-hidden="true">
                        <span className="editor-switch-thumb" />
                      </span>
                      <span className="editor-switch-text">
                        <span className="editor-switch-title">Video publicado</span>
                        <span className="editor-switch-desc">
                          {values.published
                            ? 'Visible para los estudiantes en el catálogo de videos.'
                            : 'Queda como borrador y no será visible hasta que lo publiques.'}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="editor-actions">
                  <Button type="submit" disabled={busy} icon={Save} className="editor-save">
                    {busy ? 'Guardando…' : 'Guardar video'}
                  </Button>
                  <Button to="/videos" variant="secondary">Cancelar</Button>
                  {videoId ? (
                    <button type="button" className="course-cta-delete ml-auto" onClick={() => setConfirmOpen(true)} disabled={busy}>
                      <Trash2 size={15} aria-hidden="true" /> Eliminar video
                    </button>
                  ) : null}
                </div>
              </form>

              <aside className="editor-aside" aria-label="Ayuda del editor">
                <div className="editor-status">
                  <p className="editor-aside-label">Estado actual</p>
                  <StatusBadge variant={values.published ? 'success' : 'warning'} dot>
                    {values.published ? 'Publicado' : 'Borrador'}
                  </StatusBadge>
                  <p className="editor-status-text">
                    {values.published
                      ? 'Los estudiantes encontrarán este video en el catálogo.'
                      : 'El video no aparecerá en el catálogo hasta que lo publiques.'}
                  </p>
                </div>

                <div className="editor-tips">
                  <p className="editor-aside-label"><Lightbulb size={13} aria-hidden="true" /> Consejos</p>
                  <ul className="editor-tips-list">
                    <li>Usa un enlace directo al video.</li>
                    <li>Comprueba la vista previa antes de guardar.</li>
                    <li>Publica cuando el contenido esté revisado.</li>
                  </ul>
                </div>

                <div className="editor-note">
                  <Link2 size={15} aria-hidden="true" />
                  <span>El video se reproduce desde YouTube; no se sube ningún archivo a la plataforma.</span>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>

      <Modal
        open={confirmOpen}
        onClose={closeDelete}
        title="Eliminar video"
        description="El video desaparecerá del catálogo de la plataforma. El contenido original seguirá disponible en YouTube."
        footer={
          <>
            <Button variant="secondary" onClick={closeDelete} disabled={deleteBusy}>Cancelar</Button>
            <Button variant="danger" icon={Trash2} onClick={confirmDelete} disabled={deleteBusy}>
              {deleteBusy ? 'Eliminando…' : 'Eliminar video'}
            </Button>
          </>
        }
      >
        <p className="delete-warning">Esta acción no se puede deshacer.</p>
        {values.title ? <p className="delete-target">{values.title}</p> : null}
        {deleteError ? <Message tone="error" className="mt-3">{deleteError}</Message> : null}
      </Modal>
    </div>
  );
}
