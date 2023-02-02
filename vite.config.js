import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const commonConfig = { plugins: [react()] };

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
