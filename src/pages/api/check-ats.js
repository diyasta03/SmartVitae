// pages/api/check-ats.js

import formidable from 'formidable'; // Pastikan Anda sudah menginstal: npm install formidable
import fs from 'fs';
import path from 'path';

// Ini sangat penting untuk API routes yang menerima file.
// Memberi tahu Next.js untuk tidak mem-parsing body request secara default,
// sehingga kita bisa menanganinya sendiri dengan 'formidable'.
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Pastikan request method adalah POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Inisialisasi formidable untuk mengurai form data
  const form = formidable({});

  // --- KRUSIAL: Atur direktori unggahan ke /tmp ---
  // Lingkungan serverless seperti Vercel hanya mengizinkan penulisan di /tmp
  form.uploadDir = '/tmp'; 

  // Anda bisa membuat sub-direktori unik di dalam /tmp jika perlu
  // const uniqueUploadDir = path.join('/tmp', `uploads-${Date.now()}`);
  // if (!fs.existsSync(uniqueUploadDir)) {
  //   fs.mkdirSync(uniqueUploadDir);
  // }
  // form.uploadDir = uniqueUploadDir;
  // --- Akhir dari bagian krusial ---

  // Proses form data (file dan fields lainnya)
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form data:', err);
      return res.status(500).json({ error: 'Terjadi kesalahan saat mengurai data formulir.' });
    }

    // Ambil file CV dari objek 'files'
    // formidable versi 3.x mengembalikan array untuk files
    const cvFile = files.cvFile; // Asumsikan nama field di FormData adalah 'cvFile'

    if (!cvFile || !cvFile[0]) {
      return res.status(400).json({ error: 'File CV tidak ditemukan dalam unggahan.' });
    }

    const uploadedFilePath = cvFile[0].filepath; // Path file sementara di /tmp
    const originalFilename = cvFile[0].originalFilename;
    const fileMimeType = cvFile[0].mimetype;

    console.log(`File diunggah sementara ke: ${uploadedFilePath}`);
    console.log(`Nama asli file: ${originalFilename}`);
    console.log(`Tipe MIME file: ${fileMimeType}`);

    try {
      // --- Mulai Pemrosesan File ---

      // Baca konten file dari path sementara di /tmp
      const fileBuffer = fs.readFileSync(uploadedFilePath);
      
      // Di sini Anda akan mengimplementasikan logika utama ATS Checker Anda.
      // Contoh: Kirim fileBuffer (atau teks yang diekstrak dari PDF/DOCX) ke LLM
      // untuk analisis. Jika Anda mengirim file PDF, pastikan LLM API Anda mendukungnya.
      // Atau, gunakan library untuk mengekstrak teks dari PDF di sini jika LLM hanya butuh teks.

      // Contoh dummy hasil analisis ATS:
      const atsResults = {
        score: Math.floor(Math.random() * 100), // Skor acak untuk contoh
        feedback: [
          "Pastikan semua bagian CV Anda jelas dan mudah dibaca oleh mesin.",
          "Gunakan kata kunci yang relevan dari deskripsi pekerjaan.",
          "Pertimbangkan untuk menyertakan ringkasan profil yang kuat.",
          "Cek konsistensi format dan font."
        ],
        // Anda bisa menambahkan detail lain dari analisis LLM di sini
      };

      // --- Akhir Pemrosesan File ---

      // --- KRUSIAL: Hapus file sementara dari /tmp setelah diproses ---
      // Ini adalah praktik terbaik meskipun /tmp akan dibersihkan
      fs.unlinkSync(uploadedFilePath); 
      console.log(`File sementara ${uploadedFilePath} berhasil dihapus.`);

      // Kirim hasil analisis kembali ke klien
      res.status(200).json({ success: true, results: atsResults });

    } catch (processError) {
      console.error('Error during file processing or ATS analysis:', processError);

      // Pastikan file sementara dihapus meskipun ada error
      if (fs.existsSync(uploadedFilePath)) {
          fs.unlinkSync(uploadedFilePath);
          console.log(`File sementara ${uploadedFilePath} dihapus setelah error.`);
      }
      
      return res.status(500).json({ error: processError.message || 'Terjadi kesalahan internal saat memproses CV Anda.' });
    }
  });
}