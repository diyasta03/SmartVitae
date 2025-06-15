import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';

// Handlebars helpers
handlebars.registerHelper('split', (str, sep) => (typeof str === 'string' ? str.split(sep) : []));
handlebars.registerHelper('trim', (str) => (typeof str === 'string' ? str.trim() : ''));

// Safe data
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
  const templatePath = path.join(process.cwd(), 'public', 'templates', templateFileName);
  const htmlTemplate = await fs.readFile(templatePath, 'utf-8');
  const template = handlebars.compile(htmlTemplate);
  const finalHtml = template(safeData);

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: true,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
  });

  await browser.close();
  return pdfBuffer;
}
