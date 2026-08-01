import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// 1. GET: Ambil Semua Data Demografi (Publik)
router.get('/', async (req, res) => {
  try {
    const data = await prisma.demografi.findMany();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. POST: Tambah Data Demografi Baru (Proteksi Admin)
router.post('/', async (req, res) => {
  const { kategori, label, jumlah } = req.body;
  try {
    const dataBaru = await prisma.demografi.create({
      data: { kategori, label, jumlah: parseInt(jumlah) }
    });
    res.status(201).json({ success: true, message: 'Data demografi berhasil ditambahkan', data: dataBaru });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 3. PUT: Update Data Demografi berdasarkan ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { kategori, label, jumlah } = req.body;
  try {
    const dataUpdated = await prisma.demografi.update({
      where: { id: id },
      data: { kategori, label, jumlah: parseInt(jumlah) }
    });
    res.json({ success: true, message: 'Data demografi diperbarui', data: dataUpdated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 4. DELETE: Hapus Data Demografi berdasarkan ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.demografi.delete({ where: { id: id } });
    res.json({ success: true, message: 'Data demografi berhasil dihapus' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;