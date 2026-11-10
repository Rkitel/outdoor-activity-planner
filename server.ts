import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { performDeepHealthCheck } from './api/health';
import { checkAllEndpointsAvailability } from './api/apiavailability';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// GET /api/health
app.get('/api/health', async (_req, res) => {
  try {
    const health = await performDeepHealthCheck();
    res.setHeader('Content-Type', 'application/json');
    res.json(health);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve health status', details: String(err) });
  }
});

// GET /api/apiavailability
app.get('/api/apiavailability', async (_req, res) => {
  try {
    const report = await checkAllEndpointsAvailability();
    res.setHeader('Content-Type', 'application/json');
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Failed to check API availability', details: String(err) });
  }
});

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
