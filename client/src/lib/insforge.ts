/**
 * InsForge SDK singleton for the browser. Values come from Vite env (see vite-env.d.ts).
 * Used by InsforgeProvider and by Board for database + realtime calls.
 */
import { createClient } from '@insforge/sdk';

export const insforge = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_BASE_URL,
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY,
  autoRefreshToken: true,
  persistSession: true,
});
