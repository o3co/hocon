/**
 * Prefix an internal path with the configured base.
 *
 * The site is served from a project path (`/hocon/`) on GitHub Pages, so a
 * bare `/start/quickstart/` resolves to the wrong place. Going through this
 * helper keeps the base in astro.config.mjs as the single place that knows it.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}
