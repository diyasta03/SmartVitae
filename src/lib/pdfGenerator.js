import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

// Configure Chromium for better performance
chromium.setGraphicsMode = false;

// ✅ Register Handlebars Helpers
handlebars.registerHelper('gte', (a, b) => a >= b);
handlebars.registerHelper('lt', (a, b) => a < b);
handlebars.registerHelper('and', (a, b) => a && b);
handlebars.registerHelper('formatDate', (date) => new Date(date).toLocaleDateString());

// 🔒 Data Safety Layer
const getSafeData = (data) => ({
  // Score and Ratings
  overallScore: data.overallScore || 0,
  scoreBreakdown: data.scoreBreakdown || {
    relevance: 0,
    completeness: 0,
    impact: 0
  },

  // Personal Information
  personalInfo: {
    name: data.personalInfo?.name || '',
    email: data.personalInfo?.email || '',
    phone: data.personalInfo?.phone || '',
    location: data.personalInfo?.location || '',
    portfolio: data.personalInfo?.portfolio || '',
    linkedin: data.personalInfo?.linkedin || '',
    ...data.personalInfo
  },

  // Sections with Array Fallbacks
  experience: data.experience?.map(exp => ({
    title: exp.title || '',
    company: exp.company || '',
    period: exp.period || '',
    description: exp.description || '',
    ...exp
  })) || [],

  education: data.education?.map(edu => ({
    degree: edu.degree || '',
    institution: edu.institution || '',
    period: edu.period || '',
    ...edu
  })) || [],

  skills: data.skills?.map(skill => ({
    name: skill.name || '',
    level: skill.level || 0,
    ...skill
  })) || [],

  projects: data.projects?.map(project => ({
    title: project.title || '',
    description: project.description || '',
    technologies: project.technologies || [],
    ...project
  })) || [],

  certifications: data.certifications || [],

  // Analysis Data
  missingKeywords: data.missingKeywords || [],
  actionItems: data.actionItems || [],
  improvements: data.improvements || [],
  strengths: data.strengths || [],

  // Text Content
  summary: data.summary || '',
  jobTitle: data.jobTitle || '',
  companyName: data.companyName || '',

  // Metadata
  generatedAt: new Date().toLocaleString(),
  ...data
});

// 🚀 PDF Generator Function
export async function generatePdfFromTemplate(data, templateFileName) {
  const safeData = getSafeData(data);
  
  try {
    // 1. Compile Template
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

    // 2. Launch Browser (with environment detection)
    const launchOptions = {
      headless: 'new',
      defaultViewport: { width: 1200, height: 1800 },
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox'
      ]
    };

    if (process.env.NODE_ENV === 'production') {
      launchOptions.args = [...launchOptions.args, ...chromium.args];
      launchOptions.executablePath = await chromium.executablePath();
    } else {
      // Local development paths
      launchOptions.executablePath = 
        process.platform === 'darwin'
          ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
          : process.platform === 'win32'
            ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
            : '/usr/bin/google-chrome';
    }

    const browser = await puppeteer.launch(launchOptions);

    // 3. Generate PDF
    const page = await browser.newPage();
    
    // Set longer timeout for complex templates
    await page.setDefaultNavigationTimeout(60000);
    
    await page.setContent(finalHtml, { 
      waitUntil: ['networkidle0', 'domcontentloaded'] 
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
    console.error('PDF Generation Error:', {
      error: error.message,
      stack: error.stack,
      template: templateFileName,
      timestamp: new Date().toISOString()
    });
    
    throw new Error(`PDF generation failed: ${error.message}`);
  }
}