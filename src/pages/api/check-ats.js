// pages/api/check-ats.js
import multer from 'multer';
import fs from 'fs';
import path from 'path';
// Pastikan path ini benar untuk file cvProcessor Anda
import { processCvWithAI } from '@/lib/cvProcessor'; 

// --- HAPUS BAGIAN INI ---
// const uploadDir = path.join(process.cwd(), 'uploads');
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir);
// }
// --- HAPUS BAGIAN INI ---

// Konfigurasi Multer
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            // --- KRUSIAL: Ubah destinasi ke /tmp ---
            // `/tmp` adalah satu-satunya direktori yang bisa ditulis di Vercel/Lambda
            cb(null, '/tmp'); 
        },
        filename: (req, file, cb) => {
            // Pastikan nama file unik untuk menghindari tabrakan jika ada beberapa invokasi
            cb(null, Date.now() + '-' + Math.random().toString(36).substring(2, 8) + '-' + file.originalname);
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // Batasan ukuran file 10MB
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/pdf',
            'application/msword', // .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Jenis file tidak didukung. Mohon unggah PDF, DOC, atau DOCX.'), false);
        }
    }
});

// Helper function untuk membungkus Multer dalam Promise
const runMiddleware = (req, res, fn) => {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
};

// Main API handler
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Metode tidak diizinkan. Hanya POST yang didukung.' });
    }

    let filePath = null; // Deklarasi di luar try agar bisa diakses di finally

    try {
        await runMiddleware(req, res, upload.single('cvFile'));

        if (!req.file) {
            return res.status(400).json({ message: 'Tidak ada file CV yang diunggah.' });
        }

        filePath = req.file.path; // Dapatkan path file setelah Multer selesai
        const fileMimeType = req.file.mimetype;

        console.log(`Mulai memproses CV dari ${filePath} (${fileMimeType})`);
        
        // Panggil fungsi proses dari cvProcessor Anda
        // Pastikan processCvWithAI mengambil path file dan mime type
        const atsResults = await processCvWithAI(filePath, fileMimeType);
        
        console.log(`CV berhasil diproses.`);

        res.status(200).json({
            message: 'CV berhasil diproses untuk pengecekan ATS',
            results: atsResults,
        });

    } catch (error) {
        console.error('Error saat memproses CV di API Route:', error);

        let errorMessage = 'Terjadi kesalahan saat memproses CV.';
        if (error.message.includes('Jenis file tidak didukung')) {
            errorMessage = error.message;
        } else if (error.message.includes('File too large')) {
            errorMessage = 'Ukuran file terlalu besar. Maksimal 10MB.';
        } else {
            // Jika error datang dari processCvWithAI, mungkin sudah ada pesan yang lebih spesifik
            errorMessage = error.message; 
        }

        res.status(500).json({
            message: 'Terjadi kesalahan pada server.',
            error: errorMessage
        });
    } finally {
        // Hapus file sementara dari /tmp
        // Pastikan filePath terdefinisi dan file ada sebelum dihapus
        if (filePath && fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) console.error('Gagal menghapus file sementara:', err);
                else console.log(`File sementara dihapus: ${filePath}`);
            });
        }
    }
}

// Penting: Nonaktifkan body parser default Next.js untuk rute ini
export const config = {
    api: {
        bodyParser: false,
    },
};