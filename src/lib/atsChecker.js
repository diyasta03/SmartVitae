/**
 * Menganalisis kompatibilitas CV dengan ATS
 * @param {string} cvText - Teks dari CV
 * @param {string|null} jobTitle - Judul pekerjaan (opsional)
 * @returns {Promise<Object>} Hasil analisis
 */
export async function checkATSCompliance(cvText, jobTitle = null) {
  const prompt = `
  Anda adalah ahli ATS dengan pengalaman 10+ tahun. Analisis CV berikut berdasarkan parameter:
  
  1. Format & Struktur (20%)
  2. Penggunaan Kata Kunci (25%)
  3. Keterbacaan (20%)
  4. Relevansi ${jobTitle ? `untuk ${jobTitle}` : ''} (15%)
  5. Kuantifikasi Pencapaian (10%)
  6. Bahasa & Tata Bahasa (10%)

  **CV:**
  ${cvText.substring(0, 15000)} // Batasi teks untuk menghindari token overflow

  Berikan hasil dalam format JSON berikut:
  {
    "overallScore": 0-100,
    "atsCompatibility": {
      "score": 0-100,
      "grade": "A-F",
      "description": "string"
    },
    "detailedAnalysis": {
      // Analisis per kategori
    },
    "actionableTips": [
      {
        "category": "string",
        "action": "string",
        "priority": "high|medium|low",
        "example": "string"
      }
    ]
  }
  `;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 2000
      }),
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('ATS Analysis Error:', error);
    throw new Error(`Gagal menganalisis CV: ${error.message}`);
  }
}