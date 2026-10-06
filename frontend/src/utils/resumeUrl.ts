export const getResumeFullUrl = (rawUrl?: string): string => {
  if (!rawUrl) return '';
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('blob:')) {
    return rawUrl;
  }
  const cleanPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
  return `http://localhost:8080${cleanPath}`;
};
