import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../index.js'; // Mengimpor middleware proteksi dari index.js

const router = express.Router();
const prisma = new PrismaClient();

// Helper Function: Membuat Slug dari Judul secara otomatis
const createSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// ==========================================
// 1. GET: Ambil Semua Berita (Publik)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const berita = await prisma.berita.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: berita });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. GET: Ambil Single Berita Berdasarkan Slug (Publik)
// ==========================================
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const berita = await prisma.berita.findUnique({
      where: { slug: slug }
    });

    if (!berita) {
      return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
    }

    res.json({ success: true, data: berita });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. POST: Tambah Berita Baru (Terproteksi Admin)
// ==========================================
router.post('/', requireAuth, async (req, res) => {
  const { judul, konten, kategori, gambarUrl } = req.body;

  // Generate slug unik menggunakan timestamp
  const slug = `${createSlug(judul)}-${Date.now()}`;

  try {
    const beritaBaru = await prisma.berita.create({
      data: {
        judul,
        slug,
        konten,
        kategori,
        gambarUrl
      }
    });
    res.status(201).json({ success: true, message: 'Berita berhasil diterbitkan', data: beritaBaru });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4. PUT: Update Berita Berdasarkan ID (Terproteksi Admin)
// ==========================================
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { judul, konten, kategori, gambarUrl } = req.body;

  try {
    // Siapkan data update
    const updateData = { konten, kategori, gambarUrl };

    // Jika judul diubah, perbarui juga slug-nya
    if (judul) {
      updateData.judul = judul;
      updateData.slug = `${createSlug(judul)}-${Date.now()}`;
    }

    const beritaUpdated = await prisma.berita.update({
      where: { id: id },
      data: updateData
    });

    res.json({ success: true, message: 'Berita berhasil diperbarui', data: beritaUpdated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 5. DELETE: Hapus Berita Berdasarkan ID (Terproteksi Admin)
// ==========================================
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.berita.delete({
      where: { id: id }
    });
    res.json({ success: true, message: 'Berita berhasil dihapus' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;