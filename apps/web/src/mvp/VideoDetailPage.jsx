import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Pencil, Video } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api } from './api';
import { useAuth } from './AuthContext';
import { youtubeEmbedUrl } from './youtube';

export function VideoDetailPage() {
  const { videoId } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api(`/videos/${videoId}`).then(({ video: data }) => {
      if (active) setVideo(data);
    }).catch((cause) => {
      if (active) setError(cause.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [videoId]);

  const isOwner = user?.role === 'teacher' && user.id === video?.teacherId;

  return (
    <div className="videos-page">
      <section className="video-detail">
        <div className="site-container">
          <Link to="/videos" className="video-detail-back">
            <ArrowLeft size={16} aria-hidden="true" /> Volver a Videos
          </Link>

          {loading ? (
            <div aria-hidden="true">
              <p className="sr-only" role="status">Cargando video…</p>
              <div className="editor-card editor-skeleton video-detail-skeleton" />
            </div>
          ) : error || !video ? (
            <div className="videos-empty videos-empty-compact">
              <span className="videos-empty-search" aria-hidden="true"><Video size={22} /></span>
              <h1 className="videos-empty-title">Video no disponible</h1>
              <p className="videos-empty-text">{error || 'No encontramos este video.'}</p>
              <div className="videos-empty-action">
                <Button to="/videos" variant="secondary">Volver a Videos</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="video-detail-head">
                <p className="video-detail-eyebrow">Video educativo</p>
                <div className="video-detail-title-row">
                  <h1 className="video-detail-title">{video.title}</h1>
                  {!video.published ? <StatusBadge variant="warning" dot>Borrador</StatusBadge> : null}
                </div>
                {video.description ? <p className="video-detail-desc">{video.description}</p> : null}
              </div>

              <div className="video-detail-player">
                <iframe
                  src={youtubeEmbedUrl(video.youtubeVideoId)}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>

              {!video.published ? (
                <p className="video-detail-note">Este video está en borrador y solo tú puedes verlo.</p>
              ) : null}

              <div className="video-detail-actions">
                <a href={video.youtubeUrl} target="_blank" rel="noreferrer" className="video-detail-link">
                  <ExternalLink size={16} aria-hidden="true" /> Ver en YouTube
                </a>
                {isOwner ? (
                  <Button to={`/docente/videos/${video.id}/editar`} variant="secondary" icon={Pencil}>
                    Editar video
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
