import formidable from 'formidable';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { extractTextFromPDF } from '@/lib/extractPdfText';

// --- FUNGSI-FUNGSI HELPER UNTUK AI ---

async function parseCVToJSON(cvText) {
  const prompt = `
  Anda adalah asisten cerdas yang sangat ahli dalam mem-parsing teks mentah dari sebuah CV dan mengubahnya menjadi format JSON yang terstruktur. Pastikan setiap entri dalam 'experience' dan 'education' memiliki 'id' unik (misalnya, exp1, edu1).

  CV Text:
  ---
  ${cvText}
  ---

  Harap kembalikan HANYA objek JSON dengan struktur yang diminta. Jangan tambahkan penjelasan atau teks lain di luar JSON.
  Struktur: { "personalInfo": { "name": "...", "email": "...", "phone": "..." }, "summary": "...", "experience": [{ "id": "exp1", "jobTitle": "...", "company": "...", "startDate": "...", "endDate": "...", "description": "..." }], "education": [{ "id": "edu1", "institution": "...", "degree": "...", "gradYear": "..." }], "skills": ["...", "..."], "projects": [], "certification": [] }
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

  if (!data.choices || data.choices.length === 0) {
    console.error("AI (parseCVToJSON) did not return choices. Full response:", JSON.stringify(data, null, 2));
    throw new Error("Gagal mem-parsing CV, respons dari AI tidak valid.");
  }

  return JSON.parse(data.choices[0].message.content);
}

async function analyzeCVWithAI(parsedCvData, jobDescription) {
  const cvJSONString = JSON.stringify(parsedCvData, null, 2);
  const prompt = `
  Anda adalah seorang ahli rekrutmen. Tugas Anda adalah menilai sebuah CV (format JSON) terhadap deskripsi pekerjaan. Untuk setiap saran di 'suggestions' dan 'actionItems', sertakan 'targetSection' dan 'targetId' yang merujuk pada 'id' di JSON CV agar perubahan bisa diterapkan.

  CV (JSON):
  ${cvJSONString}

  Deskripsi Pekerjaan:
  ${jobDescription}

  Harap kembalikan HANYA data JSON analisis. Contoh: { "overallScore": 80, "categories": [{ "name": "Keterampilan", "score": 85, "suggestions": [{ "text": "Tambahkan pengalaman 'Agile'", "type": "REWRITE_DESCRIPTION", "targetSection": "experience", "targetId": "exp1" }] }], "missingKeywords": [], "actionItems": [] }
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

  if (!data.choices || data.choices.length === 0) {
    console.error("AI (analyzeCVWithAI) did not return choices. Full response:", JSON.stringify(data, null, 2));
    throw new Error("Gagal menganalisis CV, respons dari AI tidak valid.");
  }

  return JSON.parse(data.choices[0].message.content);
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
    // 1. Cek sesi pengguna
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized: Anda harus login.' });
    }
    const user = session.user;

    // 2. Proses upload file
    const data = await new Promise((resolve, reject) => {
      const form = formidable();
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const file = data.files.cvFile?.[0];
    const jobDescription = data.fields.jobDescription?.[0];
    const companyName = data.fields.companyName?.[0];
    const jobTitle = data.fields.jobTitle?.[0];

    if (!file || !jobDescription) {
      return res.status(400).json({ error: 'CV atau deskripsi pekerjaan tidak ditemukan.' });
    }

    // 3. Panggil AI untuk analisis
    const text = await extractTextFromPDF(file.filepath);
    const parsedCvData = await parseCVToJSON(text);
    const analysisResult = await analyzeCVWithAI(parsedCvData, jobDescription);
    
    // 4. Simpan hasil analisis ke database
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
      console.error("Gagal menyimpan riwayat analisis:", insertError);
    }
    
    // 5. Kirim kembali hasil ke frontend
    return res.status(200).json({ parsedCvData, analysisResult });

  } catch (error) {
    console.error("Error dalam proses analisis CV:", error);
    return res.status(500).json({ 
      error: 'Gagal memproses CV Anda',
      details: error.message 
    });
  }
}