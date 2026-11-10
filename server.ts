import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import healthHandler from './api/health';
import apiAvailabilityHandler from './api/apiavailability';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serverless route handlers mounted on Express for local dev & preview
app.all('/api/health', (req, res) => healthHandler(req, res));
app.all('/api/apiavailability', (req, res) => apiAvailabilityHandler(req, res));

async function start() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
