import formidable from 'formidable';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'; // Atau createServerClient jika App Router
import { extractTextFromPDF } from '@/lib/extractPdfText'; // Utility untuk ekstraksi teks PDF

// --- FUNGSI-FUNGSI HELPER UNTUK AI ---

async function parseCVToJSON(cvText) {
  const prompt = `
  Anda adalah asisten cerdas yang sangat ahli dalam mem-parsing teks mentah dari sebuah CV dan mengubahnya menjadi format JSON yang terstruktur. Pastikan setiap entri dalam 'experience' dan 'education' memiliki 'id' unik (misalnya, exp1, edu1) agar bisa ditargetkan untuk perubahan.

  CV Text:
  ---
  ${cvText}
  ---

  Harap kembalikan HANYA objek JSON dengan struktur yang diminta. Jangan tambahkan penjelasan atau teks lain di luar JSON.
  Struktur: { "personalInfo": { "name": "...", "email": "...", "phone": "..." }, "summary": "...", "experience": [{ "id": "exp1", "jobTitle": "...", "company": "...", "startDate": "...", "endDate": "...", "description": "..." }], "education": [{ "id": "edu1", "institution": "...", "degree": "...", "gradYear": "..." }], "skills": ["...", "..."], "projects": [], "certification": [] }
  `;

  // Menggunakan OpenRouter API untuk memanggil model Deepseek Prover
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-prover-v2:free', // Model yang Anda pilih
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" } // Penting agar AI mengembalikan JSON
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.choices || data.choices.length === 0) {
    console.error("AI (parseCVToJSON) did not return choices or response was not OK. Full response:", JSON.stringify(data, null, 2));
    throw new Error(`Gagal mem-parsing CV: ${data.error ? data.error.message : 'Respons AI tidak valid atau ada kesalahan.'}`);
  }

  return JSON.parse(data.choices[0].message.content);
}

async function analyzeCVWithAI(parsedCvData, jobDescription) {
  const cvJSONString = JSON.stringify(parsedCvData, null, 2);
  const prompt = `
  Anda adalah seorang ahli rekrutmen. Tugas Anda adalah menilai sebuah CV (format JSON) terhadap deskripsi pekerjaan yang diberikan. Berikan analisis yang komprehensif, termasuk skor keseluruhan, kekuatan utama, area perbaikan, analisis per kategori, dan kata kunci yang hilang. Untuk setiap saran di 'suggestions' dan 'actionItems', jika relevan, sertakan 'targetSection' (misalnya 'experience', 'education', 'skills') dan 'targetId' yang merujuk pada 'id' unik di JSON CV agar perubahan bisa diterapkan secara spesifik.

  CV (JSON):
  ${cvJSONString}

  Deskripsi Pekerjaan:
  ${jobDescription}

  Harap kembalikan HANYA data JSON analisis.
  Struktur yang diharapkan:
  {
    "overallScore": number, // Skor keseluruhan kecocokan (0-100)
    "strengths": [ // Kategori di mana CV sangat kuat
      {
        "category": string, // Contoh: "Pengalaman Relevan", "Keterampilan Teknis"
        "description": string // Penjelasan mengapa ini kekuatan
      }
    ],
    "improvements": [ // Kategori di mana CV perlu perbaikan (skor rendah)
      {
        "category": string, // Contoh: "Penyesuaian Kata Kunci", "Format CV"
        "score": number, // Skor untuk kategori ini (0-100)
        "description": string, // Penjelasan mengapa ini area perbaikan
        "suggestion": string // Saran spesifik untuk perbaikan
      }
    ],
    "categories": [ // Analisis per kategori detail
      {
        "name": string, // Nama kategori, misal: "Keselarasan Keterampilan", "Pengalaman Kerja"
        "score": number, // Skor kategori (0-100)
        "description": string, // Penjelasan detail untuk skor kategori ini
        "suggestions": [string] // Daftar rekomendasi perbaikan untuk kategori ini
      }
    ],
    "missingKeywords": [string], // Kata kunci penting dari deskripsi pekerjaan yang tidak ada atau kurang di CV
    "actionItems": [ // Item tindakan umum atau spesifik yang bisa diterapkan ke CV
      {
        "text": string, // Deskripsi tindakan
        "type": string, // Tipe tindakan, e.g., "REWRITE_DESCRIPTION", "ADD_SKILL", "QUANTIFY_ACHIEVEMENT"
        "targetSection": string, // Bagian CV yang ditargetkan, e.g., "experience", "education", "skills", "summary"
        "targetId": string // ID unik dari entri yang ditargetkan (jika ada, misal "exp1")
      }
    ]
  }
  `;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-prover-v2:free',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" }
    }),
  });
  
  const data = await response.json();

  if (!response.ok || !data.choices || data.choices.length === 0) {
    console.error("AI (analyzeCVWithAI) did not return choices or response was not OK. Full response:", JSON.stringify(data, null, 2));
    throw new Error(`Gagal menganalisis CV: ${data.error ? data.error.message : 'Respons AI tidak valid atau ada kesalahan.'}`);
  }

  return JSON.parse(data.choices[0].message.content);
}

// --- KONFIGURASI API NEXT.JS ---

// Pastikan bodyParser di nonaktifkan agar formidable bisa memproses file
export const config = {
  api: {
    bodyParser: false,
  },
};

// --- HANDLER UTAMA API ---

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Inisialisasi Supabase client untuk server-side
  // Pastikan variabel lingkungan Supabase sudah disiapkan di .env.local atau di lingkungan deployment
  const supabase = createPagesServerClient({ req, res });

  try {
    // 1. Cek sesi pengguna
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized: Anda harus login untuk menggunakan fitur ini.' });
    }
    const user = session.user;

    // 2. Proses upload file menggunakan formidable
    const data = await new Promise((resolve, reject) => {
      const form = formidable();
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Formidable error:", err);
          return reject(new Error('Gagal memproses file yang diunggah.'));
        }
        // formidable 3.x returns arrays for fields and files
        const processedFields = {};
        for (const key in fields) {
            processedFields[key] = fields[key][0]; // Ambil elemen pertama jika array
        }
        const processedFiles = {};
        for (const key in files) {
            processedFiles[key] = files[key][0]; // Ambil elemen pertama jika array
        }
        resolve({ fields: processedFields, files: processedFiles });
      });
    });

    const file = data.files.cvFile;
    const jobDescription = data.fields.jobDescription;
    const companyName = data.fields.companyName || null;
    const jobTitle = data.fields.jobTitle || null;

    if (!file || !jobDescription) {
      return res.status(400).json({ error: 'CV (file PDF) atau deskripsi pekerjaan tidak ditemukan.' });
    }

    // 3. Ekstraksi teks dari PDF dan panggil AI untuk analisis
    const text = await extractTextFromPDF(file.filepath); // Pastikan ini mengembalikan teks yang baik
    const parsedCvData = await parseCVToJSON(text); // Parsing CV ke JSON terstruktur
    const analysisResult = await analyzeCVWithAI(parsedCvData, jobDescription); // Analisis CV dengan deskripsi pekerjaan
    
    // 4. Simpan hasil analisis ke database Supabase
    const { error: insertError } = await supabase
      .from('analysis_history') // Nama tabel Anda di Supabase
      .insert({
        user_id: user.id,
        job_description: jobDescription,
        overall_score: analysisResult.overallScore,
        analysis_result: analysisResult, // Simpan objek JSON lengkap
        company_name: companyName,
        job_title: jobTitle,
      });

    if (insertError) {
      console.error("Gagal menyimpan riwayat analisis ke database:", insertError);
      // Anda bisa memilih untuk tetap mengembalikan hasil analisis meskipun gagal menyimpan ke DB
    }
    
    // 5. Kirim kembali hasil ke frontend
    return res.status(200).json({ 
        message: 'Analisis CV berhasil!',
        parsedCvData, // Mungkin tidak perlu dikirim ke frontend jika tidak digunakan
        analysisResult 
    });

  } catch (error) {
    console.error("Error dalam proses analisis CV:", error);
    return res.status(500).json({ 
      error: 'Gagal memproses CV Anda',
      details: error.message 
    });
  }
}