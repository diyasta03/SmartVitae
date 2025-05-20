import formidable from 'formidable';
import { extractTextFromPDF } from '@/lib/extractPdfText';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function analyzeCVWithAI(cvText, jobDescription) {
  const prompt = `
  Anda diminta untuk menilai kecocokan sebuah CV dengan deskripsi pekerjaan. Berikut adalah informasi yang tersedia:

  **CV:**
  ${cvText}

  **Deskripsi Pekerjaan:**
  ${jobDescription}

  Tugas Anda adalah:
  1. Berikan analisis dalam format JSON yang terstruktur dengan komponen berikut:
     - overallScore: skor keseluruhan (0-100)
     - categories: array objek dengan properti:
       - name: nama kategori
       - score: skor (0-100)
       - description: penjelasan singkat
       - suggestions: array string saran perbaikan
     - missingKeywords: array kata kunci yang hilang
     - actionItems: array string tindakan spesifik

  2. Kategori yang harus dinilai:
     - Kesesuaian Keterampilan
     - Pengalaman Kerja
     - Pendidikan
     - Struktur & Format

  Contoh format output yang diharapkan:
  {
    "overallScore": 75,
    "categories": [
      {
        "name": "Kesesuaian Keterampilan",
        "score": 85,
        "description": "Keterampilan Anda sangat sesuai dengan kebutuhan pekerjaan ini.",
        "suggestions": [
          "Tambahkan lebih banyak kata kunci spesifik",
          "Soroti pengalaman dengan teknologi tertentu"
        ]
      }
    ],
    "missingKeywords": ["React", "Agile"],
    "actionItems": [
      "Tambahkan bagian proyek",
      "Sertakan metrik pencapaian"
    ]
  }

  Harap kembalikan HANYA data JSON tanpa penjelasan tambahan.
  `;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-prover-v2:free',
      messages: [
        { role: 'system', content: 'Kamu adalah seorang ahli dalam membantu mencocokkan CV dengan deskripsi pekerjaan. Kembalikan respons dalam format JSON yang terstruktur.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: "json_object" }
    }),
  });

  const data = await response.json();
  
  try {
  const rawContent = data.choices[0].message.content;
  console.log("AI raw response:", rawContent); // Debug

  // Cari hanya isi JSON-nya dari teks yang dikembalikan
  const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in AI response");
  }

  const result = JSON.parse(jsonMatch[0].trim());
  return result;
} catch (error) {
  console.error("Error parsing AI response:", error);
  throw new Error("Failed to parse AI response");
}
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(500).json({ error: 'Error parsing form' });
    }

    const file = files.cvFile && files.cvFile[0]; 
    const jobDescription = fields.jobDescription[0];

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description not provided' });
    }

    try {
      const text = await extractTextFromPDF(file.filepath);
      const analysisResult = await analyzeCVWithAI(text, jobDescription);
      
      return res.status(200).json(analysisResult);
    } catch (error) {
      console.error("Error in processing:", error);
      return res.status(500).json({ 
        error: 'Failed to process CV',
        details: error.message 
      });
    }
  });
}