import { generatePdfFromTemplate } from '../../lib/cvpdfGenerator'; // Kita gunakan kembali fungsi ini

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const { formData, templateName } = req.body;

    if (!formData || !templateName) {
      return res.status(400).json({ error: 'Missing formData or templateName' });
    }

    // Tentukan file template mana yang akan digunakan
    const templateFileName = `${templateName}.html`; // Contoh: "ModernTemplate.html"

    // Panggil fungsi generator PDF yang sudah ada
    const pdfBuffer = await generatePdfFromTemplate(formData, templateFileName);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="cv_smartvitae.pdf"');
    res.write(pdfBuffer, 'binary');
    res.end(null, 'binary');

  } catch (error) {
    console.error("Error in generate-cv handler:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate CV PDF.', details: error.message });
    }
  }
}