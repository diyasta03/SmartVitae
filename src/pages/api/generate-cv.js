import { generatePdfFromTemplate } from '../../lib/cvpdfGenerator';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    const { formData, templateName } = req.body;

    if (!formData || !templateName) {
      return res.status(400).json({ error: 'Missing formData or templateName' });
    }

    const templateFileName = `${templateName}.html`;
    const pdfBuffer = await generatePdfFromTemplate(formData, templateFileName);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="cv_smartvitae.pdf"');
    res.write(pdfBuffer);
    res.end();
  } catch (error) {
    console.error("Error in generate-cv handler:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate CV PDF.', details: error.message });
    }
  }
}
