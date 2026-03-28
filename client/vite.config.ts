/**
 * Vite build/dev configuration for the SyncBoard client (React + TypeScript).
 * @see https://vite.dev/config/
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // React Fast Refresh and JSX transform for .tsx files.
  plugins: [react()],
});
