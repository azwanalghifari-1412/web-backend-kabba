import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Import Modular Routes
import beritaRoutes from './routes/berita.js';
import demografiRoutes from './routes/demografi.js';
import umkmRoutes from './routes/umkm.js';
import wisataRoutes from './routes/wisata.js';
import aparaturRoutes from './routes/aparatur.js';

dotenv.config();

const app = express();

// Inisialisasi Supabase Client untuk Auth Login
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware Global
app.use(cors());
app.use(express.json());

// --- 1. ENDPOINT AUTH: Login Admin ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  return res.status(200).json({
    success: true,
    message: 'Login Berhasil',
    token: data.session.access_token,
    user: data.user
  });
});

// --- 2. REGISTRASI RUTE MODULAR ---
app.use('/api/berita', beritaRoutes);
app.use('/api/demografi', demografiRoutes);
app.use('/api/umkm', umkmRoutes);
app.use('/api/wisata', wisataRoutes);
app.use('/api/aparatur', aparaturRoutes);

// Test Endpoint Root
app.get('/', (req, res) => {
  res.send('API Desa Kabba Aktif & Berjalan!');
});

// Listener Port & Serverless Export untuk Vercel
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend Desa Kabba aktif di http://localhost:${PORT}`);
  });
}

export default app;