import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig(({ ssrBuild }) => {
  return ssrBuild
    ? {
        plugins: [react()],
        build: {
          outDir: 'dist/server',
          ssr: true,
          ssrManifest: true,
          copyPublicDir: false,
          rollupOptions: {
            input: 'src/client/entry-server.jsx',
          },
        },
        ssr: {
          noExternal: true,
          external: ['react', 'react-dom'],
        },
      }
    : {
        plugins: [react()],
        build: {
          outDir: 'dist/client',
        },
      };
});
