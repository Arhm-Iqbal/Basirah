export function safeAuthNextPath(path: string | null) {
  if (path && path.startsWith('/') && !path.startsWith('//')) {
    return path;
  }

  return '/app';
}
