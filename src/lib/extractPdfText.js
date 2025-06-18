// lib/extractPdfText.js
import { promises as fs } from 'fs'; // Mengimpor versi promises dari fs
import pdfParse from 'pdf-parse';

/**
 * Mengekstrak teks dari file PDF menggunakan jalur file.
 * Menggunakan operasi file asinkron dan menghapus file setelah diproses.
 * @param {string} filePath - Path absolut ke file PDF sementara yang diunggah.
 * @returns {Promise<string>} Teks yang diekstrak dari PDF.
 * @throws {Error} Jika gagal membaca atau mengurai PDF.
 */
export async function extractTextFromPDF(filePath) {
  let dataBuffer;
  try {
    // Menggunakan fs.promises.readFile() untuk membaca file secara asinkron
    dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (err) {
    console.error("PDF extraction error:", err);
    // Anda bisa menambahkan logika yang lebih spesifik di sini
    // Misalnya, memeriksa err.code untuk ENOENT (file not found)
    if (err.code === 'ENOENT') {
      throw new Error(`File PDF tidak ditemukan: ${filePath}`);
    } else {
      throw new Error(`Gagal mengekstrak teks dari PDF: ${err.message || err}`);
    }
  } finally {
    // === Optimalisasi Penting: Membersihkan file sementara ===
    // Ini memastikan file dihapus bahkan jika terjadi error.
    if (filePath) {
      try {
        await fs.unlink(filePath); // Menghapus file secara asinkron
        console.log(`File sementara dihapus: ${filePath}`);
      } catch (unlinkErr) {
        console.error(`Gagal menghapus file sementara ${filePath}:`, unlinkErr);
        // Jangan melempar error di sini, karena error utama mungkin sudah ditangani.
      }
    }
  }
}