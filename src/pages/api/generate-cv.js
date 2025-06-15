import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';

// Register Handlebars helpers
handlebars.registerHelper('split', function (str, separator) {
  if (typeof str !== 'string') return [];
  return str.split(separator);
});

handlebars.registerHelper('trim', function (str) {
  if (typeof str !== 'string') return '';
  return str.trim();
});

// Helper untuk memastikan data selalu aman
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
  let browser = null;

  try {
    // 🔁 Lokasi template HTML (pastikan berada di public/templates/)
    const templatePath = path.join(process.cwd(), 'public', 'templates', templateFileName);
    const htmlTemplate = await fs.readFile(templatePath, 'utf-8');

    // Compile HTML dengan Handlebars
    const template = handlebars.compile(htmlTemplate);
    const finalHtml = template(safeData);

    // Jalankan headless Chromium (serverless config)
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    // Muat HTML dan tunggu resource selesai
    await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

    // Render PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    });

    return pdfBuffer;
  } catch (error) {
    console.error("Error in PDF Generation on Vercel:", error);
    throw error;
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
}
