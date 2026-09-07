import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API routes mount FIRST
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'bank-soal-cbt-engine', timestamp: new Date().toISOString() });
  });

  // Strict API 404 Handler - Never return HTML for API requests
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `API endpoint tidak ditemukan: ${req.method} ${req.originalUrl}`,
    });
  });

  // API Error Handler - Always return JSON for API requests
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[API Error Handler]', err);
    if (req.originalUrl?.startsWith('/api')) {
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Terjadi kesalahan internal pada server',
      });
    }
    next(err);
  });

  // Vite middleware for development / static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Bank Soal & CBT Engine] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
