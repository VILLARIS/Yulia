const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error ?? 'No se pudo completar la operación');
    error.status = response.status;
    error.details = body.details;
    throw error;
  }
  return body;
}

export async function uploadCourseCover(courseId, file) {
  const { upload } = await api(`/courses/${courseId}/cover/upload-url`, {
    method: 'POST',
    body: JSON.stringify({ contentType: file.type, size: file.size }),
  });
  const response = await fetch(upload.url, {
    method: upload.method,
    headers: upload.headers,
    body: file,
  });
  if (!response.ok) throw new Error('No se pudo subir la portada. Inténtalo de nuevo.');
  return api(`/courses/${courseId}/cover/confirm`, {
    method: 'POST',
    body: JSON.stringify({ path: upload.path }),
  });
}

export function deleteCourse(courseId) {
  return api(`/courses/${courseId}`, { method: 'DELETE' });
}

export function deleteSimulation(simulationId) {
  return api(`/simulations/${simulationId}`, { method: 'DELETE' });
}

export function deleteVideo(videoId) {
  return api(`/videos/${videoId}`, { method: 'DELETE' });
}
