import { createServer as createViteServer } from 'vite';
import express from 'express';
import apiRouter from './api.js';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import fs from 'fs';
import path from 'path';
import { usePathFromURL } from './hooks.js';

const { COOKIE_SECRET = 'secret', NODE_ENV, PORT = 3000 } = process.env;
const { __dirname } = usePathFromURL(import.meta.url);
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

app.use('*', async (req, res, next) => {
  const url = req.originalUrl;

  try {
    // 1. Read index.html
    let template = fs.readFileSync(
      path.resolve(__dirname, '../..', 'index.html'),
      'utf-8'
    );

    // 2. Apply Vite HTML transforms. This injects the Vite HMR client, and
    //    also applies HTML transforms from Vite plugins, e.g. global preambles
    //    from @vitejs/plugin-react
    template = await vite.transformIndexHtml(url, template);

    // 3. Load the server entry. vite.ssrLoadModule automatically transforms
    //    your ESM source code to be usable in Node.js! There is no bundling
    //    required, and provides efficient invalidation similar to HMR.
    const { render } = await vite.ssrLoadModule(
      path.resolve(__dirname, '..', 'client', 'entry-server.jsx')
    );

    console.log('render', render);

    // 4. render the app HTML. This assumes entry-server.js's exported `render`
    //    function calls appropriate framework SSR APIs,
    //    e.g. ReactDOMServer.renderToString()
    const appHtml = await render(url);

    // 5. Inject the app-rendered HTML into the template.
    const html = template.replace(`<!--ssr-outlet-->`, appHtml);

    // 6. Send the rendered HTML back.
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
  } catch (e) {
    // If an error is caught, let Vite fix the stack trace so it maps back to
    // your actual source code.
    vite.ssrFixStacktrace(e);
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
