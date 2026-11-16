// Resolve media URLs returned by the API.
// The backend may return absolute URLs, or relative paths like
// "posts/abc.jpg", "uploads/posts/abc.jpg", or bare filenames.
const BASE_URL = (import.meta.env.VITE_SOCKET_URL || 'https://fggg.space').replace(/\/$/, '');

export const resolveMediaUrl = (url, folder = 'posts') => {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/uploads/')) return `${BASE_URL}${url}`;
  if (url.startsWith('uploads/')) return `${BASE_URL}/${url}`;
  // Already contains a subfolder like "posts/abc.jpg" or "avatars/abc.jpg"
  if (url.includes('/')) return `${BASE_URL}/uploads/${url}`;
  // Bare filename: uploaded videos live in /uploads/videos regardless of caller default
  if (/^videos-/i.test(url)) return `${BASE_URL}/uploads/videos/${url}`;
  return `${BASE_URL}/uploads/${folder}/${url}`;
};

export default resolveMediaUrl;
