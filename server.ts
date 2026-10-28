import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { handleApiRequest } from './src/server/apiRoutes.ts';

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded media directly from public/uploads
app.use('/uploads', express.static(path.resolve('public/uploads')));

// Delegate all /api requests to shared handler
app.use(async (req, res, next) => {
  if (req.url?.startsWith('/api')) {
    await handleApiRequest(req, res, next);
  } else {
    next();
  }
});

// Serve Vite dev middlewares or static production build
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: HOST, port: PORT, allowedHosts: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[KBZLife LMS] Full-stack server running on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[KBZLife LMS] Server startup failed:', err);
  process.exit(1);
});
