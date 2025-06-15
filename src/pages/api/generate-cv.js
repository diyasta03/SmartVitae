import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core'; // Use puppeteer-core for serverless

export default async function handler(req, res) {
  try {
    // Ensure this is set before launching Puppeteer
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    // Your PDF generation logic here
    // ...

    await browser.close();
    res.status(200).send('PDF generated successfully');
  } catch (error) {
    console.error('Error in generate-cv handler:', error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
}