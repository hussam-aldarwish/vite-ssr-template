import { createServer as createViteServer } from 'vite';
import express from 'express';
import apiRouter from './api.js';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

const { COOKIE_SECRET = 'secret', NODE_ENV, PORT = 3000 } = process.env;
const isDevelopment = NODE_ENV !== 'production';

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'custom',
});

const app = express();
app.set('port', normalizePort(PORT));

if (!isDevelopment) {
  app.use(compression());
}
app.use(logger('dev', { skip: (_, res) => res.statusCode < 400 }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(COOKIE_SECRET));

app.use(vite.middlewares);

app.use('/api', apiRouter);

app.use('*', async () => {
  // serve index.html - we will tackle this next
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
