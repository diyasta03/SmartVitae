import { OpenAI } from 'openai';

export const runtime = "edge";

export async function POST(req) {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const { formData } = await req.json();
    // --- PERBAIKAN DI SINI: Ekstrak data dari struktur yang baru ---
    const personalInfo = formData.personalInfo || {};
    // Ambil entri pertama dari setiap array sebagai konteks utama
    const firstExperience = formData.experiences?.[0] || {};
    const firstEducation = formData.educations?.[0] || {};
    const firstProject = formData.projects?.[0] || {};
    const skills = formData.skills || '';
    console.log("Data diterima di server:", formData);

     const prompt = `Tuliskan ringkasan profesional singkat untuk bagian Summary dalam CV, gunakan sudut pandang orang pertama ("Saya"). Gunakan bahasa Indonesia yang formal namun tetap natural. Ringkasan harus fokus pada pengalaman kerja, keahlian, pendidikan, proyek, dan tujuan karier berdasarkan data berikut. Buat ringkasan maksimal 3-5 kalimat, padat dan menjual.

    Data CV:
    - Nama: ${personalInfo.name}
    - Profesi: ${personalInfo.profession}
    - Pendidikan: ${firstEducation.degree} di ${firstEducation.institution} (${firstEducation.date})
    - Pengalaman: ${firstExperience.jobTitle} di ${firstExperience.company} (${firstExperience.date})
    - Keahlian: ${skills}
    - Proyek: ${firstProject.name}
    
    PENTING: Jangan sertakan kalimat pembuka atau basa-basi seperti "Berikut adalah contoh...". Langsung berikan HANYA paragraf ringkasannya saja. Output harus langsung dimulai dengan "Saya adalah...".
    `;

    const completion = await client.chat.completions.create({
      model: "meta-llama/llama-4-maverickss:free", // Change model name if needed
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const summary = completion.choices[0].message.content;

    // Hanya mengirim summary tanpa format atau tanda lainnya
    return new Response(
      JSON.stringify({ summary }), 
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Terjadi error di server:", error); // Log error
    return new Response(
      JSON.stringify({ error: "Gagal generate summary", detail: error.message }),
      { status: 500 }
    );
  }
}