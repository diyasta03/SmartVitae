import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "edge";

export async function POST(req) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Terjadi error di server:", error); // Log error
    return new Response(
      JSON.stringify({ error: "Gagal generate summary", detail: error.message }),
      { status: 500 }
    );
  }
}
