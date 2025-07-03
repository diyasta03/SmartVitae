// pages/api/utils/cvProcessor.js

// Import library yang diperlukan
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs'); // Node.js File System module untuk membaca file
const pdf = require('pdf-parse'); // Untuk mengekstrak teks dari PDF
const mammoth = require('mammoth'); // Untuk mengekstrak teks dari DOCX 

// Ambil GEMINI_API_KEY dari environment variables.
// Next.js secara otomatis memuatnya dari file .env di root proyek.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

// Validasi keberadaan API Key
if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY is not set in .env file!");
    // Penting: Lempar error agar API Route bisa menangkap dan merespons dengan benar
    throw new Error("GEMINI_API_KEY is missing. Please set it in your .env file at the project root.");
}

// Inisialisasi Google Generative AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Pilih model Gemini yang akan digunakan.
// gemini-1.5-flash seringkali lebih baik untuk kasus ini karena lebih cepat
// dan memiliki kuota yang lebih tinggi di free tier.
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
// Jika Anda ingin mencoba model yang lebih powerful (tapi mungkin kuotanya lebih ketat):
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

/**
 * Mengekstrak teks dari file PDF.
 * @param {string} filePath - Path lengkap ke file PDF.
 * @returns {Promise<string>} - Teks yang diekstrak dari PDF.
 */
async function extractTextFromPdf(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error("Gagal mengekstrak teks dari PDF:", error);
        throw new Error("Gagal mengekstrak teks dari PDF.");
    }
}

/**
 * Mengekstrak teks dari file DOCX.
 * @param {string} filePath - Path lengkap ke file DOCX.
 * @returns {Promise<string>} - Teks yang diekstrak dari DOCX.
 */
async function extractTextFromDocx(filePath) {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value; // Konten teks dari DOCX
    } catch (error) {
        console.error("Gagal mengekstrak teks dari DOCX:", error);
        throw new Error("Gagal mengekstrak teks dari DOCX.");
    }
}

/**
 * Memproses CV menggunakan AI untuk pengecekan kompatibilitas ATS.
 * @param {string} filePath - Path ke file CV yang diunggah.
 * @param {string} fileMimeType - MIME type dari file yang diunggah (misal: 'application/pdf').
 * @returns {Promise<object>} - Objek berisi skor ATS dan feedback.
 */
async function processCvWithAI(filePath, fileMimeType) {
    let cvText;

    // Tentukan metode ekstraksi teks berdasarkan MIME type file
    if (fileMimeType === 'application/pdf') {
        cvText = await extractTextFromPdf(filePath);
    } else if (fileMimeType === 'application/msword' ||
               fileMimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cvText = await extractTextFromDocx(filePath);
    } else {
        throw new Error("Jenis file tidak didukung untuk pemrosesan AI. Hanya PDF, DOC, dan DOCX.");
    }

    // Periksa apakah teks CV berhasil diekstrak
    if (!cvText || cvText.trim() === '') {
        throw new Error("Tidak dapat mengekstrak teks dari CV. CV mungkin kosong atau rusak.");
    }

    // Prompt yang akan dikirim ke model Gemini AI
    const prompt = `Saya memiliki teks resume berikut. Harap evaluasi seberapa baik resume ini dioptimalkan untuk sistem pelacakan pelamar (ATS). Berikan skor ATS dari 0 hingga 100. Selain itu, berikan umpan balik yang dapat ditindaklanjuti dalam bentuk poin-poin tentang bagaimana resume dapat ditingkatkan agar lebih ramah ATS, fokus pada:
- Kata kunci (apakah ada kata kunci umum yang hilang atau tidak relevan dengan peran yang umum dicari di industri target?)
- Pemformatan (apakah ATS akan kesulitan membaca bagian tertentu, seperti header, bullet points, atau layout yang rumit? Apakah ada elemen visual yang mengganggu atau pemformatan yang tidak konsisten?)
- Struktur (apakah bagian-bagiannya jelas dan mudah diidentifikasi, misal Contact, Summary, Experience, Education, Skills, dll.?)
- Keterbacaan keseluruhan oleh mesin (misal font, ukuran, spasi, konsistensi penggunaan kapitalisasi dan tanda baca).
- Apakah ada informasi berlebihan atau kurang penting yang bisa dihapus?
- Apakah ada informasi penting yang hilang yang biasanya dicari ATS?

Berikan respons Anda dalam format JSON dengan kunci 'score' (integer) dan 'feedback' (array of strings). Pastikan JSON valid dan tidak ada teks tambahan di luar blok JSON. Jangan sertakan markdown code block untuk JSON, langsung saja berikan objek JSON-nya.

Contoh format respons yang diharapkan:
{"score": 75, "feedback": ["Pertimbangkan menambahkan lebih banyak kata kunci dari deskripsi pekerjaan umum di industri Anda.", "Pastikan konsistensi penggunaan bold dan italic.", "Bagian pengalaman kerja Anda sudah terstruktur dengan baik."]}

Berikut adalah teks resume yang akan dianalisis:
${cvText}
`;

    try {
        // Panggil Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text(); // Dapatkan teks mentah dari respons AI

        // **PENTING:** Ekstrak JSON dari respons, karena Gemini sering membungkusnya dengan markdown code block
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
            text = jsonMatch[1].trim(); // Ambil hanya konten di dalam block JSON
        } else {
            // Jika tidak ada markdown block, tetap trim untuk menghilangkan spasi/newline berlebih
            text = text.trim();
        }

        let atsResults;
        try {
            // Parse teks yang sudah diekstrak menjadi objek JSON
            atsResults = JSON.parse(text);
        } catch (parseError) {
            console.error("Gagal mengurai respons AI sebagai JSON:", parseError);
            console.error("Respons AI mentah setelah pemrosesan:", text); // Log respons setelah pemrosesan
            // Fallback jika AI tidak mengembalikan JSON yang valid
            atsResults = {
                score: 50, // Skor default jika parsing gagal
                feedback: [
                    "Terjadi masalah dalam memproses respons AI. Pastikan format CV Anda jelas dan prompt AI meminta JSON yang valid.",
                    "Respons AI mentah (sebagian): " + text.substring(0, Math.min(text.length, 500)) + "..." // Tampilkan sebagian respons mentah
                ]
            };
        }

        // Validasi struktur atsResults yang diterima dari AI
        if (typeof atsResults.score !== 'number' || !Array.isArray(atsResults.feedback)) {
             console.warn("Struktur respons AI tidak sesuai yang diharapkan:", atsResults);
             atsResults = {
                score: atsResults.score || 50, // Gunakan skor jika ada, default 50
                feedback: atsResults.feedback || ["Format respons AI tidak lengkap. Harap periksa prompt."]
             };
        }

        return atsResults;

    } catch (error) {
        console.error('Error saat memanggil Gemini API:', error);
        // Tambahkan detail error dari Gemini untuk debugging yang lebih baik
        throw new Error('Gagal menganalisis CV dengan AI. Terjadi masalah pada layanan AI: ' + error.message);
    }
}

// Export fungsi agar bisa digunakan oleh API Route lainnya
module.exports = {
    processCvWithAI
};