import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, FileText, ImagePlus, Lightbulb, Save, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TextAreaField, TextField } from '../components/ui/Field';
import { Message } from '../components/ui/Message';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api, deleteCourse, uploadCourseCover } from './api';

const COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_COVER_BYTES = 2 * 1024 * 1024;

export function CourseEditorPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState({ title: '', description: '', published: false });
  const [wasPublished, setWasPublished] = useState(false);
  const [currentCoverUrl, setCurrentCoverUrl] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [coverError, setCoverError] = useState('');
  const [draftId, setDraftId] = useState('');
  const [loading, setLoading] = useState(Boolean(courseId));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  useEffect(() => {
    if (!courseId) return;
    let active = true;
    api(`/courses/${courseId}`).then(({ course }) => {
      if (!active) return;
      setValues({ title: course.title, description: course.description ?? '', published: course.published });
      setWasPublished(course.published);
      setCurrentCoverUrl(course.coverImageUrl ?? '');
    })
      .catch((cause) => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [courseId]);
  useEffect(() => () => { if (coverPreview) URL.revokeObjectURL(coverPreview); }, [coverPreview]);

  const hasCover = Boolean(coverFile || currentCoverUrl);
  const needsCover = values.published && !wasPublished && !hasCover;
  const preview = coverPreview || currentCoverUrl;

  const chooseCover = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setCoverError('');
    if (!COVER_TYPES.includes(file.type)) {
      setCoverFile(null);
      setCoverPreview('');
      setCoverError('La portada debe ser un archivo JPG, PNG o WebP.');
      return;
    }
    if (file.size > MAX_COVER_BYTES) {
      setCoverFile(null);
      setCoverPreview('');
      setCoverError('La portada debe pesar como máximo 2 MB.');
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setCoverError('');
    if (needsCover) {
      setError('Añade una portada antes de publicar el curso.');
      return;
    }
    setBusy(true);
    try {
      if (!courseId) {
        let id = draftId;
        if (!id) {
          const { course } = await api('/courses', {
            method: 'POST',
            body: JSON.stringify({ title: values.title, description: values.description, published: false }),
          });
          id = course.id;
          setDraftId(id);
        }
        if (coverFile) await uploadCourseCover(id, coverFile);
        await api(`/courses/${id}`, { method: 'PATCH', body: JSON.stringify(values) });
        navigate(`/docente/cursos/${id}`);
        return;
      }
      if (coverFile) await uploadCourseCover(courseId, coverFile);
      const { course } = await api(`/courses/${courseId}`, { method: 'PATCH', body: JSON.stringify(values) });
      navigate(`/docente/cursos/${course.id}`);
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  };

  const cancelTo = courseId ? `/docente/cursos/${courseId}` : '/docente';

  const closeDelete = () => {
    if (deleteBusy) return;
    setConfirmOpen(false);
    setDeleteError('');
  };
  const confirmDelete = async () => {
    setDeleteBusy(true); setDeleteError('');
    try {
      await deleteCourse(courseId);
      navigate('/docente');
    } catch (cause) { setDeleteError(cause.message); }
    finally { setDeleteBusy(false); }
  };

  return (
    <div className="courses-page editor-page">
      <section className="editor-hero">
        <div className="site-container">
          <nav className="editor-breadcrumb" aria-label="Ruta de navegación">
            <Link to="/docente" className="editor-breadcrumb-link">Panel docente</Link>
            <span className="editor-breadcrumb-sep" aria-hidden="true">/</span>
            <Link to="/docente" className="editor-breadcrumb-link">Mis cursos</Link>
            <span className="editor-breadcrumb-sep" aria-hidden="true">/</span>
            <span className="editor-breadcrumb-current" aria-current="page">{courseId ? 'Editar curso' : 'Nuevo curso'}</span>
          </nav>
          <div className="editor-hero-row">
            <div className="min-w-0">
              <p className="editor-eyebrow">Panel docente</p>
              <h1 className="editor-title">{courseId ? 'Editar curso' : 'Nuevo curso'}</h1>
              <p className="editor-subtitle">Define el espacio donde estarán tus simulaciones.</p>
            </div>
            <Link to="/docente" className="editor-back">
              <ArrowLeft size={15} aria-hidden="true" /> Volver a Mis cursos
            </Link>
          </div>
        </div>
      </section>

      <section className="editor-main">
        <div className="site-container">
          {loading ? (
            <div className="editor-grid" aria-hidden="true">
              <p className="sr-only" role="status">Cargando curso…</p>
              <div className="editor-form">
                <div className="editor-card editor-skeleton editor-skeleton-lg" />
                <div className="editor-card editor-skeleton editor-skeleton-sm" />
              </div>
              <div className="editor-aside">
                <div className="editor-card editor-skeleton editor-skeleton-sm" />
              </div>
            </div>
          ) : (
            <div className="editor-grid">
              <form onSubmit={submit} className="editor-form">
                {error ? <Message tone="error">{error}</Message> : null}

                <div className="editor-card">
                  <div className="editor-card-head">
                    <span className="editor-card-icon editor-card-icon-green" aria-hidden="true"><FileText size={18} strokeWidth={1.9} /></span>
                    <div className="editor-card-headtext">
                      <h2 className="editor-card-title">Información del curso</h2>
                      <p className="editor-card-sub">El título y la descripción que verán los estudiantes.</p>
                    </div>
                  </div>
                  <div className="editor-card-body">
                    <TextField
                      label="Título"
                      value={values.title}
                      onChange={(event) => setValues({ ...values, title: event.target.value })}
                      minLength={3}
                      maxLength={200}
                      placeholder="Ej. Bioquímica de los lípidos"
                      required
                    />
                    <TextAreaField
                      label="Descripción"
                      value={values.description}
                      onChange={(event) => setValues({ ...values, description: event.target.value })}
                      maxLength={5000}
                      rows={5}
                      hint="Explica de qué trata el curso y qué aprenderán."
                      counter={`${values.description.length}/5000`}
                      placeholder="Describe el enfoque, los temas y a quién va dirigido."
                    />
                  </div>
                </div>

                <div className="editor-card">
                  <div className="editor-card-head">
                    <span className="editor-card-icon editor-card-icon-blue" aria-hidden="true"><ImagePlus size={18} strokeWidth={1.9} /></span>
                    <div className="editor-card-headtext">
                      <h2 className="editor-card-title">Portada del curso</h2>
                      <p className="editor-card-sub">La imagen que verán los estudiantes en el catálogo.</p>
                    </div>
                  </div>
                  <div className="editor-card-body">
                    <div className="cover-field">
                      <div className="cover-preview">
                        {preview ? (
                          <img src={preview} alt="Vista previa de la portada" className="cover-preview-img" />
                        ) : (
                          <span className="cover-placeholder">
                            <ImagePlus size={28} strokeWidth={1.6} aria-hidden="true" />
                            <span>Sin portada</span>
                          </span>
                        )}
                      </div>
                      <div className="cover-upload-row">
                        <label className="cover-upload-button">
                          <ImagePlus size={16} aria-hidden="true" />
                          {preview ? 'Cambiar portada' : 'Añadir portada'}
                          <input
                            type="file"
                            accept={COVER_TYPES.join(',')}
                            onChange={chooseCover}
                            className="sr-only"
                            disabled={busy}
                          />
                        </label>
                        <span className="cover-help">JPG, PNG o WebP · máximo 2 MB · proporción 16:9</span>
                      </div>
                      {coverError ? <p className="cover-error" role="alert">{coverError}</p> : null}
                    </div>
                  </div>
                </div>

                <div className="editor-card">
                  <div className="editor-card-head">
                    <span className="editor-card-icon editor-card-icon-blue" aria-hidden="true"><Eye size={18} strokeWidth={1.9} /></span>
                    <div className="editor-card-headtext">
                      <h2 className="editor-card-title">Visibilidad</h2>
                      <p className="editor-card-sub">Controla si el curso está disponible para los estudiantes.</p>
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
                        <span className="editor-switch-title">Curso publicado</span>
                        <span className="editor-switch-desc">
                          {needsCover
                            ? 'Añade una portada para poder publicar el curso.'
                            : values.published
                              ? 'Visible para los estudiantes. Puedes despublicarlo cuando quieras.'
                              : 'Queda como borrador y no será visible hasta que lo publiques.'}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="editor-actions">
                  <Button type="submit" disabled={busy} icon={Save} className="editor-save">
                    {busy ? 'Guardando…' : 'Guardar curso'}
                  </Button>
                  <Button to={cancelTo} variant="secondary">Cancelar</Button>
                  {courseId ? (
                    <button type="button" className="course-cta-delete ml-auto" onClick={() => setConfirmOpen(true)} disabled={busy}>
                      <Trash2 size={15} aria-hidden="true" /> Eliminar curso
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
                    {needsCover
                      ? 'Añade una portada para publicar el curso.'
                      : values.published
                        ? 'Los estudiantes encontrarán este curso en el catálogo.'
                        : 'El curso no aparecerá en el catálogo hasta que lo publiques.'}
                  </p>
                </div>

                <div className="editor-tips">
                  <p className="editor-aside-label"><Lightbulb size={13} aria-hidden="true" /> Consejos</p>
                  <ul className="editor-tips-list">
                    <li>Usa un título claro y específico.</li>
                    <li>Resume el enfoque en la descripción.</li>
                    <li>Elige una portada que identifique el curso.</li>
                    <li>Publica cuando el contenido esté listo.</li>
                  </ul>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>

      <Modal
        open={confirmOpen}
        onClose={closeDelete}
        title="Eliminar curso"
        description="Se eliminará el curso, sus simulaciones, inscripciones y todo el historial relacionado de los estudiantes."
        footer={
          <>
            <Button variant="secondary" onClick={closeDelete} disabled={deleteBusy}>Cancelar</Button>
            <Button variant="danger" icon={Trash2} onClick={confirmDelete} disabled={deleteBusy}>
              {deleteBusy ? 'Eliminando…' : 'Eliminar curso'}
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
