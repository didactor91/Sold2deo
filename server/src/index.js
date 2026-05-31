/**
 * Express server entry point
 * @module server/src/index
 */
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import { requireAuth } from './middleware/auth.js';
import { findGameSaveByUserId, upsertGameSave } from './db/queries/gameSaves.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Protected routes
app.get('/api/game/save', requireAuth, async (req, res) => {
  try {
    const save = await findGameSaveByUserId(req.user.id);
    if (!save) {
      return res.json({ saveData: null });
    }
    res.json({ saveData: save.save_data });
  } catch (err) {
    console.error('Get save error:', err);
    res.status(500).json({ error: 'Failed to load save' });
  }
});

app.post('/api/game/save', requireAuth, async (req, res) => {
  try {
    const { saveData } = req.body;
    if (!saveData) {
      return res.status(400).json({ error: 'saveData is required' });
    }

    const save = await upsertGameSave(req.user.id, saveData);
    res.json({ save });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ error: 'Failed to save game' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Weld Master server running on port ${PORT}`);
});

export default app;
