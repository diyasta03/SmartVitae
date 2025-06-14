import puppeteer from 'puppeteer'; // Langsung import dari 'puppeteer'
import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';

// Helper untuk memastikan data ada sebelum digunakan di template
const getSafeData = (data) => {
  return {
    overallScore: data.overallScore || 0,
    categories: data.categories || [],
    missingKeywords: data.missingKeywords || [],
    actionItems: data.actionItems || [],
    // Tambahkan properti lain dari data Anda di sini dengan '|| []' atau '|| {}'
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
  let browser = null;

  try {
    const templatePath = path.join(process.cwd(), 'src', 'lib', 'templates', templateFileName);
    const htmlTemplate = await fs.readFile(templatePath, 'utf-8');

    const template = handlebars.compile(htmlTemplate);
    const finalHtml = template(safeData);

    // Meluncurkan browser lokal dari paket puppeteer standar
    // Konfigurasinya sangat sederhana
    browser = await puppeteer.launch({ headless: true });

    const page = await browser.newPage();
    await page.setContent(finalHtml, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    return pdfBuffer;
  } catch (error) {
    console.error("Error in PDF Generation (standard puppeteer):", error);
    throw error;
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
}