/**
 * InsForge SDK singleton for the browser. Values come from Vite env (see vite-env.d.ts).
 * Used by InsforgeProvider and by Board for database + realtime calls.
 *
 * Important: Vite bakes `VITE_*` in at **build** time. For Netlify (or any host), set
 * VITE_INSFORGE_BASE_URL and VITE_INSFORGE_ANON_KEY in the host UI and redeploy.
 */
import { createClient } from '@insforge/sdk';

const rawEnvBase = import.meta.env.VITE_INSFORGE_BASE_URL;
const trimmedFromEnv =
  typeof rawEnvBase === 'string' ? rawEnvBase.trim().replace(/\/$/, '') : '';

/**
 * True when VITE_INSFORGE_BASE_URL was non-empty at build time.
 * (A dev-only fallback to http://localhost:7130 does not count as “configured”.)
 */
export function isInsforgeConfigured(): boolean {
  return trimmedFromEnv.length > 0;
}

/** Base URL passed to the SDK: env value, or localhost only in `vite` dev without .env. */
function resolveInsforgeBaseUrl(): string {
  if (trimmedFromEnv) return trimmedFromEnv;
  if (import.meta.env.DEV) return 'http://localhost:7130';
  return '';
}

/** Shown in the UI when production build is missing env vars. */
export const insforgeDeployHint =
  'Add VITE_INSFORGE_BASE_URL and VITE_INSFORGE_ANON_KEY in your host (e.g. Netlify: Site configuration → Environment variables), save, then redeploy. In InsForge project settings, allow your live site origin as an OAuth redirect URL (e.g. https://your-app.netlify.app).';

const baseUrl = resolveInsforgeBaseUrl() || 'http://localhost:7130';

export const insforge = createClient({
  baseUrl,
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY,
  autoRefreshToken: true,
  persistSession: true,
});
