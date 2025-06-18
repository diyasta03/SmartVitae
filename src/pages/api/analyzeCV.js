import formidable from 'formidable';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'; // Atau createServerClient jika App Router
import { extractTextFromPDF } from '@/lib/extractPdfText'; // Utility untuk ekstraksi teks PDF

// --- FUNGSI-FUNGSI HELPER UNTUK AI ---


async function parseCVToJSON(cvText) {
  // Pra-pemrosesan Teks: Menghapus spasi berlebih dan baris kosong yang berurutan
  const cleanedCvText = cvText
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();

  // Prompt dengan Contoh (Few-Shot Learning) untuk akurasi yang lebih baik
  const prompt = `
  Anda adalah asisten cerdas yang sangat ahli dalam mem-parsing teks mentah dari sebuah CV dan mengubahnya menjadi format JSON yang terstruktur dan detail. Pastikan setiap entri dalam 'experience' dan 'education' memiliki 'id' unik (misalnya, exp1, exp2, edu1, edu2) agar bisa ditargetkan untuk perubahan di kemudian hari. Jika suatu bidang tidak ditemukan atau tidak relevan, gunakan nilai null. Untuk tanggal, coba ekstrak format tahun penuh (YYYY).

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

  // === Menggunakan OpenRouter API untuk parsing CV ===
  const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  const OPENROUTER_API_TOKEN = process.env.OPENROUTER_API_KEY;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Menggunakan Mixtral-8x7B-Instruct melalui OpenRouter
        model: 'mistralai/devstral-small:free',
        // Jika ingin yang paling murah/gratis (tapi mungkin kurang akurat):
        // model: 'mistralai/mistral-7b-instruct',
        // model: 'deepseek/deepseek-prover-v2:free', // Model ini juga bisa untuk parsing!

        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" }, // Penting agar AI mengembalikan JSON
        temperature: 0.2, // Rendah untuk output yang lebih deterministik
        max_tokens: 2000 // Sesuaikan, OpenRouter pakai max_tokens bukan max_new_tokens
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.choices || data.choices.length === 0) {
      console.error("OpenRouter API (parseCVToJSON) did not return choices or response was not OK. Full response:", JSON.stringify(data, null, 2));
      throw new Error(`Gagal mem-parsing CV: ${data.error ? data.error.message : 'Respons API tidak valid atau ada kesalahan.'}`);
    }

    const generatedText = data.choices[0].message.content;

    // OpenRouter dengan response_format: { type: "json_object" } seharusnya mengembalikan JSON murni.
    // Tidak perlu regex mencari {} lagi, langsung parse.
    const parsedJson = JSON.parse(generatedText);

    // Pasca-pemrosesan & Normalisasi ID Unik
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
    console.error("Error dalam parseCVToJSON:", error);
    if (error.name === 'SyntaxError') {
      console.error("Kesalahan JSON Parsing: ", error.message);
      // Untuk debugging, log respons mentah dari OpenRouter jika ada
      if (error.rawResponse) console.error("Raw OpenRouter response:", error.rawResponse);
    }
    throw new Error(`Gagal mengurai respons JSON dari AI: ${error.message}.`);
  }
}

// Fungsi analyzeCVWithAI tetap menggunakan OpenRouter seperti sebelumnya
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
      model: 'deepseek/deepseek-r1-0528:free', // Tetap menggunakan Deepseek Prover untuk analisis
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" }
    }),
  });
  
  const data = await response.json();

  if (!response.ok || !data.choices || data.choices.length === 0) {
    console.error("AI (analyzeCVWithAI) did not return choices or response was not OK. Full response:", JSON.stringify(data, null, 2));
    throw new Error(`Gagal menganalisis CV: ${data.error ? data.error.message : 'Respons AI tidak valid atau ada kesalahan.'}`);
  }

  try {
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Error parsing JSON from Deepseek Prover (analysis):", error);
    console.error("Raw content from Deepseek Prover (analysis):", data.choices[0].message.content);
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
    const parsedCvData = await parseCVToJSON(text);
    const analysisResult = await analyzeCVWithAI(parsedCvData, jobDescription);
    
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