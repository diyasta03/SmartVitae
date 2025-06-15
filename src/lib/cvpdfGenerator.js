import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';

handlebars.registerHelper('split', function(str, separator) {
    if (typeof str !== 'string') return [];
    return str.split(separator);
});

handlebars.registerHelper('trim', function(str) {
    if (typeof str !== 'string') return '';
    return str.trim();
});

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
