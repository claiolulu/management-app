import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Expose BACKEND_* env vars (e.g., BACKEND_API_URL) to import.meta.env
  envPrefix: ['VITE_', 'BACKEND_'],
});
