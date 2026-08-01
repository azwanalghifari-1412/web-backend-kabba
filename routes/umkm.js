import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js'; // Mengimpor dari middleware/auth.js

const router = express.Router();
const prisma = new PrismaClient();

// ==========================================
// 1. GET: Ambil Semua Data UMKM (Publik)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const umkmList = await prisma.umkm.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: umkmList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. GET: Detail 1 UMKM berdasarkan ID (Publik)
// ==========================================
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const umkm = await prisma.umkm.findUnique({ where: { id } });
    if (!umkm) return res.status(404).json({ success: false, message: 'Data UMKM tidak ditemukan' });
    res.json({ success: true, data: umkm });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. POST: Tambah Data UMKM (Proteksi Admin)
// ==========================================
router.post('/', requireAuth, async (req, res) => {
  const { namaProduk, namaPemilik, deskripsi, harga, kontenWa, gambarUrl } = req.body;

  try {
    const umkmBaru = await prisma.umkm.create({
      data: {
        namaProduk,
        namaPemilik,
        deskripsi,
        harga: parseFloat(harga),
        kontenWa,
        gambarUrl
      }
    });
    res.status(201).json({ success: true, message: 'Produk UMKM berhasil ditambahkan', data: umkmBaru });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4. PUT: Update Data UMKM (Proteksi Admin)
// ==========================================
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { namaProduk, namaPemilik, deskripsi, harga, kontenWa, gambarUrl } = req.body;

  try {
    const umkmUpdated = await prisma.umkm.update({
      where: { id },
      data: {
        namaProduk,
        namaPemilik,
        deskripsi,
        harga: harga ? parseFloat(harga) : undefined,
        kontenWa,
        gambarUrl
      }
    });
    res.json({ success: true, message: 'Data UMKM diperbarui', data: umkmUpdated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 5. DELETE: Hapus Data UMKM (Proteksi Admin)
// ==========================================
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.umkm.delete({ where: { id } });
    res.json({ success: true, message: 'Data UMKM berhasil dihapus' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;