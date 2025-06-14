import puppeteer from 'puppeteer'; // Atau 'puppeteer-core' jika Anda menggunakan Browserless/Serverless
import handlebars from 'handlebars';
import path from 'path';
import fs from 'fs/promises';

// --- DAFTARKAN HELPER DI SINI ---
// Ini penting agar template HTML bisa menggunakan fungsi 'split' dan 'trim'
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

        // Meluncurkan browser. Ganti bagian ini jika Anda menggunakan Browserless.io
        // Untuk metode lokal standar:
        browser = await puppeteer.launch({ headless: true });
        
        /* // Untuk metode Browserless.io (jika Anda kembali ke metode ini):
        browser = await puppeteer.connect({
            browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`,
        });
        */

        const page = await browser.newPage();
        
        // Mengatur konten halaman dan menunggu semua aset (font, gambar) selesai dimuat
        await page.setContent(finalHtml, { waitUntil: 'networkidle0' });
        
        // Membuat PDF dengan format A4
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true, // Penting agar warna background ikut tercetak
            margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
        });

        return pdfBuffer;
    } catch (error) {
        console.error("Error in PDF Generation:", error);
        throw error; // Lempar error agar bisa ditangkap oleh API handler
    } finally {
        if (browser !== null) {
            // Tutup koneksi browser setelah selesai
            await browser.close(); // Gunakan browser.disconnect() jika pakai Browserless
        }
    }
}