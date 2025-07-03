import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';
import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';

// ======================
// CONFIGURATION
// ======================
chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

// ======================
// HANDLEBARS HELPERS
// ======================
handlebars.registerHelper('gte', (a, b) => a >= b);
handlebars.registerHelper('lt', (a, b) => a < b);
handlebars.registerHelper('and', (a, b) => a && b);
handlebars.registerHelper('formatDate', (date) => 
  date ? new Date(date).toLocaleDateString() : 'Present'
);

// ======================
// DATA SAFETY LAYER
// ======================
const getSafeData = (data) => ({
  // Core Information
  personalInfo: {
    name: data.personalInfo?.name || '',
    email: data.personalInfo?.email || '',
    phone: data.personalInfo?.phone || '',
    location: data.personalInfo?.location || '',
    portfolio: data.personalInfo?.portfolio || '',
    ...data.personalInfo
  },

  // Professional Sections
  experience: data.experience?.map(exp => ({
    title: exp.title || 'Untitled Position',
    company: exp.company || 'Unknown Company',
    period: exp.period || 'Date not specified',
    description: exp.description || '',
    ...exp
  })) || [],

  education: data.education?.map(edu => ({
    degree: edu.degree || 'Unspecified Degree',
    institution: edu.institution || 'Unknown Institution',
    period: edu.period || 'Date not specified',
    ...edu
  })) || [],

  skills: data.skills?.map(skill => ({
    name: skill.name || 'Unnamed Skill',
    level: skill.level || 0,
    ...skill
  })) || [],

  // Analysis Data
  missingKeywords: data.missingKeywords || [],
  actionItems: data.actionItems || [],
  improvements: data.improvements || [],
  strengths: data.strengths || [],

  // Metadata
  generatedAt: new Date().toLocaleString(),
  jobTitle: data.jobTitle || '',
  companyName: data.companyName || '',
  ...data
});

// ======================
// PDF GENERATOR
// ======================
export async function generatePdfFromTemplate(data, templateFileName) {
  const safeData = getSafeData(data);

  try {
    // 1. COMPILE TEMPLATE
    const templatePath = path.join(
      process.cwd(), 
      'src', 
      'lib', 
      'templates', 
      templateFileName
    );
    
    const htmlTemplate = await fs.readFile(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(htmlTemplate);
    const finalHtml = compiledTemplate(safeData);

    // 2. LAUNCH BROWSER
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v119.0.0/chromium-v119.0.0-pack.tar'
      ),
      headless: chromium.headless,
      defaultViewport: {
        width: 1200,
        height: 1800,
        deviceScaleFactor: 1
      },
      timeout: 60000
    });

    // 3. GENERATE PDF
    const page = await browser.newPage();
    
    await page.emulateMediaType('screen');
    await page.setContent(finalHtml, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 60000
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      preferCSSPageSize: true,
      timeout: 60000
    });

    await browser.close();
    return pdfBuffer;

  } catch (error) {
    console.error('PDF Generation Failed:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    throw new Error(`PDF generation failed: ${error.message}`);
  }
}