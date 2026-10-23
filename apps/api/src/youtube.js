const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

export function extractYouTubeVideoId(value) {
  if (typeof value !== 'string') return null;

  let url;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  let id = null;

  if (host === 'youtu.be') {
    id = url.pathname.split('/').filter(Boolean)[0] ?? null;
  } else if (host === 'youtube.com' || host === 'm.youtube.com') {
    if (url.pathname === '/watch' || url.pathname === '/watch/') {
      id = url.searchParams.get('v');
    } else {
      const match = url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/);
      if (match) id = match[1];
    }
  }

  return id && VIDEO_ID.test(id) ? id : null;
}
