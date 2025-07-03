import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';
import chrome from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

// ✅ Daftarkan helper Handlebars
handlebars.registerHelper('gte', (a, b) => a >= b);
handlebars.registerHelper('lt', (a, b) => a < b);
handlebars.registerHelper('and', (a, b) => a && b);

// Helper untuk memastikan data aman
const getSafeData = (data) => ({
  overallScore: data.overallScore || 0,
  categories: data.categories || [],
  missingKeywords: data.missingKeywords || [],
  actionItems: data.actionItems || [],
  improvements: data.improvements || [],
  strengths: data.strengths || [],
  personalInfo: data.personalInfo || {},
  summary: data.summary || '',
  experience: data.experience || [],
  education: data.education || [],
  skills: data.skills || [],
  projects: data.projects || [],
  certification: data.certification || [],
  jobTitle: data.jobTitle || '',
  companyName: data.companyName || '',
});

export async function generatePdfFromTemplate(data, templateFileName) {
  const safeData = getSafeData(data);

  try {
    // 1. Compile template HTML
    const templatePath = path.join(process.cwd(), 'src', 'lib', 'templates', templateFileName);
    const htmlTemplate = await fs.readFile(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(htmlTemplate);
    const finalHtml = compiledTemplate(safeData);

    // 2. Launch Puppeteer with chrome-aws-lambda
    const browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
      defaultViewport: chrome.defaultViewport,
    });

    const page = await browser.newPage();

    // 3. Set HTML content and wait for rendering
    await page.setContent(finalHtml, {
      waitUntil: ['domcontentloaded', 'networkidle0'],
    });

    // 4. Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    });

    await browser.close();
    return pdfBuffer;

  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}