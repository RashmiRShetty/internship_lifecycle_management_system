import { API_BASE_URL } from '../config/api';

export const getResumeFullUrl = (rawUrl?: string): string => {
  if (!rawUrl) return '';
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('blob:')) {
    return rawUrl;
  }
  const cleanPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
  return `${API_BASE_URL}${cleanPath}`;
};
