const FALLBACK_JWT_SECRET = 'food-waste-saver-dev-secret';

/**
 * Use the configured JWT secret when available, but fall back to a local
 * development secret so auth works for fresh clones without extra setup.
 */
export function getJwtSecret() {
  return process.env.JWT_SECRET || FALLBACK_JWT_SECRET;
}
