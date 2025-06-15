import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium'; // <-- UBAH BARIS INI
import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';

// Mendaftarkan helper kustom untuk memproses data di template
handlebars.registerHelper('split', function(str, separator) {
    if (typeof str !== 'string') {
        return [];
    }
    return str.split(separator);
});

handlebars.registerHelper('trim', function(str) {
    if (typeof str !== 'string') {
        return '';
    }
    return str.trim();
});

// Fungsi untuk memastikan data default ada jika beberapa field kosong
// untuk mencegah error saat kompilasi template
const getSafeData = (data) => {
  return {
    personalInfo: data.personalInfo || {},
    summary: data.summary || '',
    experiences: data.experiences || [],
    educations: data.educations || [],
    projects: data.projects || [],
    skills: data.skills || '',
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
        
        // --- PERUBAHAN DI SINI ---
        // Secara eksplisit memberitahu bahwa ini adalah lingkungan Vercel
        chromium.setHeadlessMode = true;
        chromium.setGraphicsMode = false;

        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });
        // --- AKHIR PERUBAHAN ---

        const page = await browser.newPage();
        await page.setContent(finalHtml, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
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