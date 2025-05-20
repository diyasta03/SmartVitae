// lib/extractPdfText.js
import fs from 'fs';
import pdfParse from 'pdf-parse';

export async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (err) {
    console.error("PDF parse error:", err);
    throw new Error("Failed to extract text from PDF");
  }
}
