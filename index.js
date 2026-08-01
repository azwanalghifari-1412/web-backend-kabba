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

// Inisialisasi Supabase Client untuk Auth
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware
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

// --- 2. MIDDLEWARE PROTEKSI AUTH (EXPORTABLE) ---
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(403).json({ message: 'Token tidak valid atau kedaluwarsa.' });
  }

  req.user = user;
  next();
};

// --- 3. REGISTRASI RUTE MODULAR ---
app.use('/api/berita', beritaRoutes);
app.use('/api/demografi', demografiRoutes);
app.use('/api/umkm', umkmRoutes);       // <-- Tambahkan ini
app.use('/api/wisata', wisataRoutes);   // <-- Tambahkan ini
app.use('/api/aparatur', aparaturRoutes); // <-- Tambahkan ini

// Test Endpoint Root
app.get('/', (req, res) => {
  res.send('API Desa Kabba Aktif & Berjalan!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend Desa Kabba aktif di http://localhost:${PORT}`);
}); 