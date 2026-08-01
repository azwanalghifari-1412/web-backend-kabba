import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js'; // Mengimpor dari middleware/auth.js

const router = express.Router();
const prisma = new PrismaClient();

// Helper Function: Membuat Slug dari Nama Wisata
const createSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// ==========================================
// 1. GET: Ambil Semua Data Wisata (Publik)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const wisataList = await prisma.wisata.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: wisataList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. GET: Detail 1 Wisata Berdasarkan Slug (Publik)
// ==========================================
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const wisata = await prisma.wisata.findUnique({
      where: { slug }
    });

    if (!wisata) {
      return res.status(404).json({ success: false, message: 'Data wisata tidak ditemukan' });
    }

    res.json({ success: true, data: wisata });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. POST: Tambah Data Wisata Baru (Proteksi Admin)
// ==========================================
router.post('/', requireAuth, async (req, res) => {
  const { nama, deskripsi, lokasi, gmapsUrl, gambarUrl } = req.body;

  // Generate slug unik menggunakan timestamp
  const slug = `${createSlug(nama)}-${Date.now()}`;

  try {
    const wisataBaru = await prisma.wisata.create({
      data: {
        nama,
        slug,
        deskripsi,
        lokasi,
        gmapsUrl,
        gambarUrl
      }
    });
    res.status(201).json({ success: true, message: 'Data wisata berhasil ditambahkan', data: wisataBaru });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4. PUT: Update Data Wisata Berdasarkan ID (Proteksi Admin)
// ==========================================
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { nama, deskripsi, lokasi, gmapsUrl, gambarUrl } = req.body;

  try {
    const updateData = { deskripsi, lokasi, gmapsUrl, gambarUrl };

    // Jika nama diubah, perbarui juga slug-nya
    if (nama) {
      updateData.nama = nama;
      updateData.slug = `${createSlug(nama)}-${Date.now()}`;
    }

    const wisataUpdated = await prisma.wisata.update({
      where: { id },
      data: updateData
    });

    res.json({ success: true, message: 'Data wisata diperbarui', data: wisataUpdated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 5. DELETE: Hapus Data Wisata Berdasarkan ID (Proteksi Admin)
// ==========================================
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.wisata.delete({ where: { id } });
    res.json({ success: true, message: 'Data wisata berhasil dihapus' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;