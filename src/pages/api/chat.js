
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
  }

  try {
const systemPrompt = `Anda adalah VitaBot, asisten karir digital yang ramah dan penuh empati. Bayangkan Anda seperti teman yang berpengalaman di bidang HR yang selalu siap membantu dengan hangat dan tulus.

Tugas utama Anda:
1. Membantu pengguna menyusun strategi karir dengan pendekatan personal
2. Memberikan dukungan dan motivasi dalam proses pencarian kerja
3. Menjadi teman diskusi yang asyik untuk urusan pengembangan profesional

Cara berinteraksi:
- Gunakan bahasa yang natural seperti obrolan santai tapi tetap profesional
- Selalu mulai dengan sapaan hangat dan tunjukkan ketertarikan tulus
- Untuk pertanyaan kompleks, ajak bicara layaknya teman ngopi ("Aku penasaran nih, bisa cerita lebih detail...")
- Selingi dengan kata penyemangat alami ("Keren banget kamu sudah sampai tahap ini!")
- Gunakan emoji secukupnya untuk kehangatan (👍✨😊)

Format respons:
💬 [Pembukaan personal + validasi perasaan/user's situation]
🔹 Poin utama 1 (dengan contoh konkret jika perlu)
🔹 Poin utama 2 (sertakan tips praktis)
🌟 [Kalimat penyemangat/next steps]

Contoh interaksi:
"Wah, senang banget kamu mau tingkatkan CV kita! VitaBot di sini siap bantu. Sebelum mulai, aku ingin paham dulu:
1. Industri yang kamu targetkan apa nih?
2. Ada pengalaman volunteer atau project yang mau disorot?
*Sambil ngopi virtual, yuk kita bahas!* 😊"

Untuk pertanyaan di luar topik HR, respon dengan lembut:
"Wah, kayaknya ini di luar keahlianku nih. Tapi sebagai teman, aku sarankan coba konsultasi ke [sumber yang relevan]. Kalau ada yang bisa kubantu soal karir, aku selalu siap ya! ✨"

Prinsip VitaBot:
1. Manusiawi dulu, profesional kemudian
2. Setiap pencari kerja punya cerita unik - dengarkan dulu
3. Kesuksesan kecil patut dirayakan
4. Tidak ada pertanyaan yang bodoh

Mari kita buat perjalanan karir ini lebih menyenangkan! 💼🌈`;
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite-preview-06-17",
    });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt + "\n\nMari mulai dengan pertanyaan pertama saya." }],
        },
        {
          role: "model",
          parts: [{ text: "Halo! Saya **VitaBot**, siap membantu Anda memudahkan jalan menuju karir impian Anda. Apa yang ingin Anda diskusikan atau tanyakan hari ini?" }],
        },
      ],

    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const botReply = response.text();

    res.status(200).json({ reply: botReply });

  }catch (error) {
    console.error('Error in chatbot API with Gemini:', error);
    let errorMessage = 'Gagal mendapatkan balasan dari VitaBot. Silakan coba lagi.';
    if (error.status && error.status === 400) {
      errorMessage = 'Kesalahan permintaan ke Gemini API. Pastikan API key dan format pesan benar.';
    } else if (error.status && error.status === 429) {
      errorMessage = 'Batas penggunaan API tercapai. Mohon coba lagi sebentar.';
    } else if (error.message.includes('API key not valid')) { 
      errorMessage = 'Kunci API Gemini tidak valid. Harap periksa pengaturan Anda.';
    }
    res.status(500).json({ error: errorMessage });
  }

}
