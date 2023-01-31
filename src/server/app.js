import express from 'express';
import apiRouter from './api.js';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import fs from 'fs';
import path from 'path';
import { usePathFromURL } from './hooks.js';

const { COOKIE_SECRET = 'secret', NODE_ENV, PORT = 3000 } = process.env;
const { __dirname } = usePathFromURL(import.meta.url);
const isDevelopment = NODE_ENV !== 'production';

/**
 * @type {import('vite').ViteDevServer}
 */
let vite;

const app = express();
app.set('port', normalizePort(PORT));

if (isDevelopment) {
  vite = await (
    await import('vite')
  ).createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);
} else {
  app.use((await import('compression')).default());
  app.use(
    express.static(path.resolve(__dirname, '../../dist/client'), {
      index: false,
    })
  );
}
app.use(logger('dev', { skip: (_, res) => res.statusCode < 400 }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(COOKIE_SECRET));

app.use('/api', apiRouter);

app.use('*', async (req, res, next) => {
  try {
    const url = req.originalUrl;
    let template, render;

    if (isDevelopment) {
      template = fs.readFileSync(
        path.resolve(__dirname, '../../index.html'),
        'utf-8'
      );
      template = await vite.transformIndexHtml(url, template);
      render = (
        await vite.ssrLoadModule(
          path.resolve(__dirname, '../client/entry-server.jsx')
        )
      ).render;
    } else {
      template = fs.readFileSync(
        path.resolve(__dirname, '../../dist/client/index.html'),
        'utf-8'
      );
      render = (await import('../../dist/server/entry-server.js')).render;
    }

    const appHtml = await render(url);
    const html = template.replace(`<!--ssr-outlet-->`, appHtml);
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
  } catch (e) {
    isDevelopment && vite.ssrFixStacktrace(e);
    next(e);
  }
});

export default app;

function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}
