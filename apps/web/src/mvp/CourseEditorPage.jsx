import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, FileText, Lightbulb, Save, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TextAreaField, TextField } from '../components/ui/Field';
import { Message } from '../components/ui/Message';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api, deleteCourse } from './api';

export function CourseEditorPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState({ title: '', description: '', published: true });
  const [loading, setLoading] = useState(Boolean(courseId));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  useEffect(() => {
    if (!courseId) return;
    let active = true;
    api(`/courses/${courseId}`).then(({ course }) => { if (active) setValues({ title: course.title, description: course.description ?? '', published: course.published }); })
      .catch((cause) => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [courseId]);
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const { course } = await api(courseId ? `/courses/${courseId}` : '/courses', { method: courseId ? 'PATCH' : 'POST', body: JSON.stringify(values) });
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
                          {values.published
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
                    {values.published
                      ? 'Los estudiantes encontrarán este curso en el catálogo.'
                      : 'El curso no aparecerá en el catálogo hasta que lo publiques.'}
                  </p>
                </div>

                <div className="editor-tips">
                  <p className="editor-aside-label"><Lightbulb size={13} aria-hidden="true" /> Consejos</p>
                  <ul className="editor-tips-list">
                    <li>Usa un título claro y específico.</li>
                    <li>Resume el enfoque en la descripción.</li>
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
