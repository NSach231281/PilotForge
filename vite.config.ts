import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), '');

    return {
      server: {
        port: 3000,
        host: '0.0.0.0', // Fine for local dev
      },
      plugins: [react()],
      define: {
        // This allows you to keep using process.env in your code
        // BUT make sure 'GEMINI_API_KEY' is added in Vercel Project Settings
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          // FIX: Changed form '.' to './src'
          '@': path.resolve(__dirname, './src'),
        }
      }
    };
});
