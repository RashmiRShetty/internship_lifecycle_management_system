const withoutTrailingSlash = (url: string): string => url.replace(/\/+$/, '');

export const API_BASE_URL = withoutTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
);

export const AI_MATCHER_BASE_URL = withoutTrailingSlash(
  import.meta.env.VITE_AI_MATCHER_URL || 'http://localhost:5000',
);
