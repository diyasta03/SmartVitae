import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
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
        // Membaca file template HTML dari direktori
        const templatePath = path.join(process.cwd(), 'src', 'lib', 'templates', templateFileName);
        const htmlTemplate = await fs.readFile(templatePath, 'utf-8');

        // Mengkompilasi template dengan data yang diberikan
        const template = handlebars.compile(htmlTemplate);
        const finalHtml = template(safeData);

        // Menggunakan konfigurasi chromium khusus untuk serverless Vercel
        browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
          ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();
        
        // Mengatur konten halaman dan menunggu semua aset (font, gambar dari CDN) selesai dimuat
        await page.setContent(finalHtml, { waitUntil: 'networkidle0' });
        
        // Membuat PDF dengan format A4 dan memastikan background tercetak
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
        });

        return pdfBuffer;
    } catch (error) {
        // Memberikan log error yang lebih detail di server
        console.error("Error in PDF Generation on Vercel:", error);
        throw error; // Lempar error agar bisa ditangkap oleh API handler
    } finally {
        if (browser !== null) {
            // Menutup koneksi browser setelah selesai
            await browser.close();
        }
    }
}