const storageName = 'bioquimica_gemini_session_key';

export function getGeminiKey(userId) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageName) ?? 'null');
    return saved?.userId === userId ? saved.key : '';
  } catch { return ''; }
}

export function setGeminiKey(userId, key) {
  sessionStorage.setItem(storageName, JSON.stringify({ userId, key }));
}

export function clearGeminiKey() {
  sessionStorage.removeItem(storageName);
}
