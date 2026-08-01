import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js'; // Mengimpor dari middleware/auth.js

const router = express.Router();
const prisma = new PrismaClient();

// ==========================================
// 1. GET: Ambil Semua Data Aparatur Desa (Publik - Terurut berdasarkan field 'urutan')
// ==========================================
router.get('/', async (req, res) => {
  try {
    const listAparatur = await prisma.aparatur.findMany({
      orderBy: { urutan: 'asc' }
    });
    res.json({ success: true, data: listAparatur });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. GET: Detail 1 Aparatur berdasarkan ID (Publik)
// ==========================================
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const aparatur = await prisma.aparatur.findUnique({ where: { id } });
    if (!aparatur) return res.status(404).json({ success: false, message: 'Data aparatur tidak ditemukan' });
    res.json({ success: true, data: aparatur });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. POST: Tambah Aparatur Desa Baru (Proteksi Admin)
// ==========================================
router.post('/', requireAuth, async (req, res) => {
  const { nama, jabatan, fotoUrl, urutan } = req.body;

  try {
    const aparaturBaru = await prisma.aparatur.create({
      data: {
        nama,
        jabatan,
        fotoUrl,
        urutan: urutan ? parseInt(urutan) : 0
      }
    });
    res.status(201).json({ success: true, message: 'Data aparatur berhasil ditambahkan', data: aparaturBaru });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4. PUT: Update Data Aparatur (Proteksi Admin)
// ==========================================
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { nama, jabatan, fotoUrl, urutan } = req.body;

  try {
    const aparaturUpdated = await prisma.aparatur.update({
      where: { id },
      data: {
        nama,
        jabatan,
        fotoUrl,
        urutan: urutan !== undefined ? parseInt(urutan) : undefined
      }
    });
    res.json({ success: true, message: 'Data aparatur diperbarui', data: aparaturUpdated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 5. DELETE: Hapus Data Aparatur (Proteksi Admin)
// ==========================================
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.aparatur.delete({ where: { id } });
    res.json({ success: true, message: 'Data aparatur berhasil dihapus' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;