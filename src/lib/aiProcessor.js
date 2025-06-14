// Fungsi ini menerima data CV dan daftar perbaikan, lalu memanggil AI untuk menerapkannya.
export async function applyAIImprovements(cvData, improvements) {
  const cvJSONString = JSON.stringify(cvData, null, 2);
  const improvementsString = JSON.stringify(improvements, null, 2);

  const prompt = `
  Anda adalah seorang penulis CV profesional. Tugas Anda adalah memodifikasi sebuah objek JSON CV berdasarkan daftar instruksi perbaikan yang diberikan.

  **Objek JSON CV Saat Ini:**
  ${cvJSONString}

  **Daftar Instruksi Perbaikan:**
  ${improvementsString}

  Tugas Anda adalah:
  1. Iterasi melalui setiap instruksi dalam daftar perbaikan.
  2. Temukan item target yang sesuai di dalam JSON CV menggunakan 'targetSection' dan 'targetId'.
  3. Modifikasi HANYA item tersebut sesuai dengan instruksi. Lakukan ini untuk SEMUA instruksi.
  4. Kembalikan SELURUH objek JSON CV yang sudah diperbarui. Pastikan outputnya HANYA JSON yang valid tanpa teks tambahan.
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

  if (!response.ok) {
    throw new Error('AI request failed');
  }

  const data = await response.json();
  const rawContent = data.choices[0].message.content;
  return JSON.parse(rawContent);
}