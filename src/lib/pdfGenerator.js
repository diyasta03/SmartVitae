import puppeteer from 'puppeteer-core'; // PERUBAHAN 1: Import dari puppeteer-core
import chromium from '@sparticuz/chromium-min'; // PERUBAHAN 1: Import chromium untuk serverless
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
    personalInfo: data.personalInfo || {},
    summary: data.summary || '',
    experiences: data.experiences || [], // Diubah dari experience
    educations: data.educations || [], // Diubah dari education
    skills: data.skills || '',
    projects: data.projects || [],
    certification: data.certification || [],
  };
};

// Daftarkan helper kustom untuk Handlebars
handlebars.registerHelper('split', (str, separator) => (typeof str === 'string' ? str.split(separator) : []));
handlebars.registerHelper('trim', (str) => (typeof str === 'string' ? str.trim() : ''));


export async function generatePdfFromTemplate(data, templateFileName) {
  const safeData = getSafeData(data);
  let browser = null;

  try {
    const templatePath = path.join(process.cwd(), 'src', 'lib', 'templates', templateFileName);
    const htmlTemplate = await fs.readFile(templatePath, 'utf-8');

    const template = handlebars.compile(htmlTemplate);
    const finalHtml = template(safeData);

    // PERUBAHAN 2: Gunakan konfigurasi chromium untuk meluncurkan browser
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setContent(finalHtml, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    return pdfBuffer;
  } catch (error) {
    console.error("Error in PDF Generation (Vercel):", error);
    throw error;
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
}