import { OpenAI } from 'openai';

export const runtime = "edge";

export async function POST(req) {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const { formData } = await req.json();

    console.log("Data diterima di server:", formData);

    const prompt = `Tuliskan ringkasan profesional singkat untuk bagian Summary dalam CV, gunakan sudut pandang orang pertama (gunakan kata "Saya"). Gunakan bahasa Indonesia yang formal namun tetap natural. Ringkasan harus fokus pada pengalaman kerja, keahlian, pendidikan, proyek, dan tujuan karier.

    Nama: ${formData.name}
    Profesi: ${formData.profession}
    Alamat: ${formData.address}
    No HP: ${formData.phone}
    Email: ${formData.email}
    LinkedIn: ${formData.linkedin}
    GitHub: ${formData.github}
    Pendidikan: ${formData.educationDegree} dari ${formData.educationInstitution} (${formData.educationDate}), GPA: ${formData.educationGPA}
    Pengalaman kerja: ${formData.jobTitle} di ${formData.company} (${formData.jobDate}) - ${formData.jobDescription}
    Keterampilan: ${formData.skills}
    Proyek: ${formData.projectName} (${formData.projectDate}) - ${formData.projectDescription}
    
    Buat ringkasan maksimal 3-5 kalimat, padat dan menjual.
    `;

    const completion = await client.chat.completions.create({
      model: "deepseek/deepseek-prover-v2:free", // Change model name if needed
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
