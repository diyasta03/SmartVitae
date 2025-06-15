import handlebars from 'handlebars';
import path from 'path';
import fs from 'fs/promises';
import fetch from 'node-fetch'; // Gunakan node-fetch untuk melakukan HTTP POST ke PDFShift

// Register helper seperti sebelumnya
handlebars.registerHelper('split', function(str, separator) {
  if (typeof str !== 'string') return [];
  return str.split(separator);
});

handlebars.registerHelper('trim', function(str) {
  if (typeof str !== 'string') return '';
  return str.trim();
});

const getSafeData = (data) => ({
  personalInfo: data.personalInfo || {},
  summary: data.summary || '',
  experiences: data.experiences || [],
  educations: data.educations || [],
  projects: data.projects || [],
  skills: data.skills || '',
  certification: data.certification || [],
});

export async function generatePdfFromTemplate(data, templateFileName) {
  const safeData = getSafeData(data);

  try {
    const templatePath = path.join(process.cwd(), 'src', 'lib', 'templates', templateFileName);
    const htmlTemplate = await fs.readFile(templatePath, 'utf-8');

    const compiledTemplate = handlebars.compile(htmlTemplate);
    const finalHtml = compiledTemplate(safeData);

    // Kirim HTML ke PDFShift untuk dikonversi ke PDF
    const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.PDFSHIFT_API_KEY, // Pastikan Anda menyimpan API Key ini di .env
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: finalHtml,
        landscape: false,
        use_print: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`PDFShift error: ${response.status} - ${err}`);
    }

    const pdfBuffer = await response.buffer();
    return pdfBuffer;

  } catch (error) {
    console.error("Error in PDFShift generation:", error);
    throw error;
  }
}
