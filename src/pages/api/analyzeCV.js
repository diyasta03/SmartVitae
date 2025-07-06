import formidable from 'formidable';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { extractTextFromPDF } from '@/lib/extractPdfText';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Import Gemini API

// Inisialisasi Gemini AI
// Pastikan GOOGLE_API_KEY Anda tersedia di environment variables (.env.local)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY2);

// --- FUNGSI-FUNGSI HELPER UNTUK AI ---

async function parseCVToJSON(cvText) {
  const cleanedCvText = cvText
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();

  // Model yang lebih ringan untuk parsing
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Lebih cepat dan murah dari Pro

  const prompt = `
  Anda adalah asisten cerdas yang sangat ahli dalam mem-parsing teks mentah dari sebuah CV dan mengubahnya menjadi format JSON yang terstruktur dan detail. Pastikan setiap entri dalam 'experience', 'education', 'projects', dan 'certification' memiliki 'id' unik (misalnya, exp1, exp2, edu1, edu2) agar bisa ditargetkan untuk perubahan di kemudian hari. Jika suatu bidang tidak ditemukan atau tidak relevan, gunakan nilai null. Untuk tanggal, coba ekstrak format tahun penuh (YYYY) jika hanya tahun yang tersedia, atau format 'Bulan YYYY' jika bulan dan tahun tersedia.

  Berikut adalah beberapa contoh input dan output yang diharapkan untuk panduan:

  Contoh CV 1:
  ---
  John Doe
  john.doe@email.com | +1234567890
  Ringkasan: Seorang insinyur perangkat lunak dengan 5 tahun pengalaman di pengembangan web.

  Pendidikan:
  Universitas Teknologi, S.Kom Ilmu Komputer (2018-2022)

  Pengalaman Kerja:
  Software Engineer, Tech Solutions (Jan 2022 - Sekarang)
  - Mengembangkan dan memelihara aplikasi.

  Skills: JavaScript, React, Node.js, Python
  ---
  JSON Output 1:
  {
    "personalInfo": {
      "name": "John Doe",
      "email": "john.doe@email.com",
      "phone": "+1234567890"
    },
    "summary": "Seorang insinyur perangkat lunak dengan 5 tahun pengalaman di pengembangan web.",
    "experience": [
      {
        "id": "exp1",
        "jobTitle": "Software Engineer",
        "company": "Tech Solutions",
        "startDate": "Jan 2022",
        "endDate": "Sekarang",
        "description": "Mengembangkan dan memelihara aplikasi."
      }
    ],
    "education": [
      {
        "id": "edu1",
        "institution": "Universitas Teknologi",
        "degree": "S.Kom Ilmu Komputer",
        "gradYear": "2022"
      }
    ],
    "skills": ["JavaScript", "React", "Node.js", "Python"],
    "projects": [],
    "certification": []
  }

  Contoh CV 2:
  ---
  Jane Smith
  Marketing Specialist
  Email: jane.smith@mail.com

  Pengalaman:
  Marketing Associate di Global Brands (2020-2023)
  - Mengelola kampanye digital.

  Pendidikan:
  MBA, Business School (2019)
  ---
  JSON Output 2:
  {
    "personalInfo": {
      "name": "Jane Smith",
      "email": "jane.smith@mail.com",
      "phone": null
    },
    "summary": "Marketing Specialist",
    "experience": [
      {
        "id": "exp1",
        "jobTitle": "Marketing Associate",
        "company": "Global Brands",
        "startDate": "2020",
        "endDate": "2023",
        "description": "Mengelola kampanye digital."
      }
    ],
    "education": [
      {
        "id": "edu1",
        "institution": "Business School",
        "degree": "MBA",
        "gradYear": "2019"
      }
    ],
    "skills": [],
    "projects": [],
    "certification": []
  }

  ---
  Sekarang, proses CV Text berikut:
  ---
  ${cleanedCvText}
  ---

  Harap kembalikan HANYA objek JSON dengan struktur yang diminta. Jangan tambahkan penjelasan atau teks lain di luar JSON.
  Struktur yang diharapkan:
  {
    "personalInfo": {
      "name": "string | null",
      "email": "string | null",
      "phone": "string | null"
    },
    "summary": "string | null",
    "experience": [
      {
        "id": "string",
        "jobTitle": "string | null",
        "company": "string | null",
        "startDate": "string (e.g., 'Jan 2022' or '2022') | null",
        "endDate": "string (e.g., 'Des 2023' or 'Sekarang' or '2023') | null",
        "description": "string | null"
      }
    ],
    "education": [
      {
        "id": "string",
        "institution": "string | null",
        "degree": "string | null",
        "gradYear": "string (e.g., '2022') | null"
      }
    ],
    "skills": ["string", "..."],
    "projects": [
      {
        "id": "string",
        "name": "string | null",
        "description": "string | null",
        "technologies": ["string", "..."]
      }
    ],
    "certification": [
      {
        "id": "string",
        "name": "string | null",
        "issuer": "string | null",
        "year": "string (e.g., '2023') | null"
      }
    ]
  }
  `;

  try {
    const chat = model.startChat({
      generationConfig: {
        responseMimeType: "application/json", // Penting untuk Gemini 1.5 JSON Mode
        temperature: 0.2, // Rendah untuk output yang lebih deterministik
        maxOutputTokens: 2000,
      },
      history: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const result = await chat.sendMessage(prompt); // Mengirim prompt
    const generatedText = result.response.text();

    const parsedJson = JSON.parse(generatedText);

    // Pasca-pemrosesan & Normalisasi ID Unik (tetap diperlukan karena AI bisa saja tidak selalu sempurna)
    let expCounter = 1;
    if (Array.isArray(parsedJson.experience)) {
      parsedJson.experience = parsedJson.experience.map(exp => ({
        ...exp,
        id: `exp${expCounter++}`
      }));
    } else {
      parsedJson.experience = [];
    }
    
    let eduCounter = 1;
    if (Array.isArray(parsedJson.education)) {
      parsedJson.education = parsedJson.education.map(edu => ({
        ...edu,
        id: `edu${eduCounter++}`
      }));
    } else {
      parsedJson.education = [];
    }

    let projCounter = 1;
    if (Array.isArray(parsedJson.projects)) {
      parsedJson.projects = parsedJson.projects.map(proj => ({
        ...proj,
        id: `proj${projCounter++}`
      }));
    } else {
      parsedJson.projects = [];
    }

    let certCounter = 1;
    if (Array.isArray(parsedJson.certification)) {
      parsedJson.certification = parsedJson.certification.map(cert => ({
        ...cert,
        id: `cert${certCounter++}`
      }));
    } else {
      parsedJson.certification = [];
    }

    if (!Array.isArray(parsedJson.skills)) {
        parsedJson.skills = [];
    }

    return parsedJson;

  } catch (error) {
    console.error("Error dalam parseCVToJSON (Gemini):", error);
    if (error.name === 'SyntaxError') {
      console.error("Kesalahan JSON Parsing dari Gemini: ", error.message);
      // Untuk debugging, log respons mentah dari Gemini jika memungkinkan
      // console.error("Raw Gemini response:", generatedText); // Hati-hati dengan ini di production
    }
    throw new Error(`Gagal mengurai respons JSON dari AI: ${error.message}.`);
  }
}

async function analyzeCVWithAI(parsedCvData, jobDescription) {
  const cvJSONString = JSON.stringify(parsedCvData, null, 2);
  // Model yang lebih kuat untuk analisis kompleks
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Atau 'gemini-1.5-flash' jika Anda prioritaskan kecepatan/biaya

  const prompt = `
  Anda adalah seorang ahli rekrutmen. Tugas Anda adalah menilai sebuah CV (format JSON) terhadap deskripsi pekerjaan yang diberikan. Berikan analisis yang komprehensif, termasuk skor keseluruhan, kekuatan utama, area perbaikan, analisis per kategori, dan kata kunci yang hilang. Untuk setiap saran di 'suggestions' dan 'actionItems', jika relevan, sertakan 'targetSection' (misalnya 'experience', 'education', 'skills') dan 'targetId' yang merujuk pada 'id' unik di JSON CV agar perubahan bisa diterapkan secara spesifik (GUNAKAN BAHASA INDONESIA).

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

  try {
    const chat = model.startChat({
      generationConfig: {
        responseMimeType: "application/json", // Penting untuk Gemini 1.5 JSON Mode
        temperature: 0.2, // Rendah untuk output yang lebih deterministik
        maxOutputTokens: 2000,
      },
      history: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const result = await chat.sendMessage(prompt);
    const generatedText = result.response.text();
    
    return JSON.parse(generatedText);

  } catch (error) {
    console.error("Error dalam analyzeCVWithAI (Gemini):", error);
    if (error.name === 'SyntaxError') {
      console.error("Kesalahan JSON Parsing dari Gemini (analisis): ", error.message);
      // console.error("Raw Gemini response (analysis):", generatedText); // Hati-hati dengan ini di production
    }
    throw new Error("Gagal mengurai respons JSON dari AI untuk analisis. Silakan coba lagi atau periksa format output.");
  }
}

// --- KONFIGURASI API NEXT.JS ---

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

  const supabase = createPagesServerClient({ req, res });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized: Anda harus login untuk menggunakan fitur ini.' });
    }
    const user = session.user;

    const data = await new Promise((resolve, reject) => {
      const form = formidable();
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Formidable error:", err);
          return reject(new Error('Gagal memproses file yang diunggah.'));
        }
        const processedFields = {};
        for (const key in fields) {
            processedFields[key] = fields[key][0];
        }
        const processedFiles = {};
        for (const key in files) {
            processedFiles[key] = files[key][0];
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

    const text = await extractTextFromPDF(file.filepath);
    const parsedCvData = await parseCVToJSON(text); // Menggunakan Gemini
    const analysisResult = await analyzeCVWithAI(parsedCvData, jobDescription); // Menggunakan Gemini
    
    const { error: insertError } = await supabase
      .from('analysis_history')
      .insert({
        user_id: user.id,
        job_description: jobDescription,
        overall_score: analysisResult.overallScore,
        analysis_result: analysisResult,
        company_name: companyName,
        job_title: jobTitle,
      });

    if (insertError) {
      console.error("Gagal menyimpan riwayat analisis ke database:", insertError);
    }
    
    return res.status(200).json({ 
        message: 'Analisis CV berhasil!',
        parsedCvData,
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