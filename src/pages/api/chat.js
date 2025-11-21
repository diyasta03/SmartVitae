// pages/api/chat.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, history, isInInterviewMode, companyName, jobPosition } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
  }

  try {
    let systemPrompt = `
🧠 Kamu adalah **VitaBot**, asisten karier AI yang ringkas, profesional, dan empatik.
Fokus pada: ringkasan CV, balasan interview, mock interview, strategi karier, optimasi CV ATS.
Gunakan bahasa hangat, profesional, tidak bertele-tele.
Emoji minimal. Tidak mengulang informasi.
`;

    if (isInInterviewMode) {
      if (companyName && jobPosition) {
        systemPrompt += `
MODE WAWANCARA SPESIFIK AKTIF untuk ${companyName} - ${jobPosition}.

Aturan:
1. Kamu adalah HR dari perusahaan tersebut.
2. Ajukan **satu** pertanyaan setiap giliran.
3. Pertanyaan harus relevan dengan perusahaan & posisi.
4. Abaikan pertanyaan yang tidak terkait interview.
5. Pengguna wajib klik "Reset" di UI untuk keluar mode interview.

Pertanyaan pembuka:
"Selamat datang di ${companyName}! Bisa ceritakan tentang diri Anda dan alasan Anda tertarik pada posisi ${jobPosition}?"
`;
      } else {
        systemPrompt += `
MODE WAWANCARA UMUM AKTIF.

Aturan:
1. Ajukan hanya 1 pertanyaan interview per giliran.
2. Abaikan semua pertanyaan yang tidak relevan interview.
3. Untuk keluar, pengguna harus klik tombol reset di UI.

Pertanyaan pembuka:
"Ceritakan tentang diri Anda."
`;
      }
    } else {
      systemPrompt += `
Aturan Non-Wawancara:
- Jika pengguna meminta ringkasan CV, undangan interview, tips karier → prioritaskan itu.
- Jika topik non-karier, jawab sopan:
  "Topik ini di luar keahlian VitaBot, tapi saya siap bantu soal karier 😊"
`;
    }

    systemPrompt += `Tetap ringkas dan fokus pada nilai.`;

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: systemPrompt,
});


    const chat = model.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const botReply = response.text();

    res.status(200).json({ reply: botReply });

  } catch (error) {
    console.error('Error in API Gemini:', error);

    let errorMessage = 'Gagal mendapatkan balasan dari VitaBot. Coba lagi.';

    if (error.status === 400) {
      errorMessage = 'Request ke Gemini salah format.';
    } else if (error.status === 429) {
      errorMessage = 'Rate limit Gemini tercapai.';
    } else if (error.message?.includes('API key not valid')) {
      errorMessage = 'API key Gemini tidak valid.';
    } else if (error.message?.includes("First content should be with role 'user'")) {
      errorMessage = 'Riwayat chat bermasalah. Silakan reset percakapan.';
    }

    res.status(500).json({ error: errorMessage });
  }
}
