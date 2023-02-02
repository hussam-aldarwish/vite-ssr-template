import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

/**
 * @type {import('vite').UserConfig}
 */
const commonConfig = { plugins: [react()] };

/**
 * @type {import('vite').UserConfig}
 */
const ssrConfig = {
  build: {
    outDir: 'dist/client-ssr',
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
};

/**
 * @type {import('vite').UserConfig}
 */
const clientConfig = {
  build: {
    outDir: 'dist/client',
  },
};

// https://vitejs.dev/config/
export default defineConfig(({ ssrBuild }) => ({
  ...commonConfig,
  ...(ssrBuild ? ssrConfig : clientConfig),
}));
