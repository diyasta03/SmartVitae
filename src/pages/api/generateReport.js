import { generatePdfFromTemplate } from '../../lib/pdfGenerator'; // Kita akan modifikasi sedikit file ini

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const { analysisResult } = req.body;

    if (!analysisResult) {
      return res.status(400).json({ error: 'Missing analysisResult data' });
    }

    // Panggil fungsi generator PDF dengan template laporan
    const pdfBuffer = await generatePdfFromTemplate(analysisResult, 'report-template.html');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Laporan_Analisis_CV.pdf"');
    res.write(pdfBuffer, 'binary');
    res.end(null, 'binary');

  } catch (error) {
    console.error("Error in generateReport handler:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate report PDF.', details: error.message });
    }
  }
}