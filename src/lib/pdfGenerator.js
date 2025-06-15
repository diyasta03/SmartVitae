import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';
import fetch from 'node-fetch'; // Pastikan ini di-install jika belum

// Helper untuk memastikan data ada sebelum digunakan di template
const getSafeData = (data) => {
  return {
    overallScore: data.overallScore || 0,
    categories: data.categories || [],
    missingKeywords: data.missingKeywords || [],
    actionItems: data.actionItems || [],
    personalInfo: data.personalInfo || {},
    summary: data.summary || '',
    experience: data.experience || [],
    education: data.education || [],
    skills: data.skills || [],
    projects: data.projects || [],
    certification: data.certification || [],
  };
};

export async function generatePdfFromTemplate(data, templateFileName) {
  const safeData = getSafeData(data);

  try {
    const templatePath = path.join(process.cwd(), 'src', 'lib', 'templates', templateFileName);
    const htmlTemplate = await fs.readFile(templatePath, 'utf-8');

    const compiledTemplate = handlebars.compile(htmlTemplate);
    const finalHtml = compiledTemplate(safeData);

    // Kirim HTML ke PDFShift
    const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.PDFSHIFT_API_KEY, // Gunakan dari environment variable
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: finalHtml,
        landscape: false,
        use_print: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PDFShift failed: ${response.status} - ${errorText}`);
    }

    const pdfBuffer = await response.buffer();
    return pdfBuffer;

  } catch (error) {
    console.error("Error in PDF Generation (PDFShift):", error);
    throw error;
  }
}
