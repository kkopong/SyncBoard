/// <reference types="vite/client" />

/**
 * Declares Vite `import.meta.env` keys used by the client (copied into client/.env).
 * Keeps TypeScript aware of InsForge URL and anon key without `any`.
 */
interface ImportMetaEnv {
  readonly VITE_INSFORGE_BASE_URL: string;
  readonly VITE_INSFORGE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
