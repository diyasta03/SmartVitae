import nlp from 'compromise';
import { format, parse } from 'date-fns';
import { Ollama } from 'ollama';

// Helper: Normalisasi Teks CV
function normalizeCVText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[•▪➢▶]/g, '-')
    .replace(/([a-z])\.([a-z])/g, '$1 $2')
    .replace(/[^\w\s@+-\/]/g, ' ');
}

// Helper: Ekstraksi Section
function extractSection(text, startRegex, endRegex) {
  const start = new RegExp(startRegex, 'i');
  const end = new RegExp(endRegex, 'i');
  const startIndex = text.search(start);
  
  if (startIndex === -1) return null;
  
  const remaining = text.slice(startIndex);
  const endIndex = remaining.search(end);
  
  return endIndex !== -1 
    ? remaining.slice(0, endIndex).trim()
    : remaining.trim();
}

// 1. Template Parser (LinkedIn/Europass)
function parseWithTemplates(text) {
  // LinkedIn Style
  if (/experience\s*.+\n.+\n.+\bcompany\b/gi.test(text)) {
    const expSection = extractSection(text, 'experience', 'education');
    const experiences = expSection?.split('\n')
      .map(line => {
        const match = line.match(/(.+?)\s+at\s+(.+?)\s*\((.*?)\)/i);
        return match && { title: match[1], company: match[2], period: match[3] };
      })
      .filter(Boolean);
    
    return { score: 80, data: { experiences } };
  }

  // Europass Style
  if (/personal\s*information|work\s*history/gi.test(text)) {
    const name = text.match(/(?:nama|name)\s*:\s*(.+)/i)?.[1];
    const email = text.match(/\b\w+@\w+\.\w{2,}\b/)?.[0];
    return { score: 75, data: { personalInfo: { name, email } } };
  }

  return { score: 0 };
}

// 2. NLP Rule-Based Parser
function parseWithNLP(text) {
  const doc = nlp(text);
  const name = doc.match('#Person').text() || 
               text.split('\n')[0].trim();
  
  const emails = doc.emails().out('array');
  const phones = doc.phoneNumbers().out('array');

  const skills = doc.match('#Skill+').out('array');
  const experiences = extractSection(text, 'experience', 'education')
    ?.split('\n')
    .filter(line => line.trim().length > 10);

  return {
    score: (name && emails.length) ? 65 : 30,
    data: {
      personalInfo: { name, email: emails[0], phone: phones[0] },
      skills,
      experiences: experiences?.slice(0, 5) || []
    }
  };
}

// 3. Local AI Fallback (Ollama)
async function parseWithOpenRouter(text) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-7b-instruct:free',
      messages: [{
        role: 'user',
        content: `Parse this CV into JSON: ${text}`
      }],
      response_format: { type: "json_object" }
    })
  });
  return await response.json();
// Main Hybrid Parser
export async function parseCV(cvText) {
  const cleanText = normalizeCVText(cvText);
  
  // Step 1: Coba template-based
  const templateResult = parseWithTemplates(cleanText);
  if (templateResult.score > 70) return templateResult.data;

  // Step 2: Coba NLP rule-based
  const nlpResult = parseWithNLP(cleanText);
  if (nlpResult.score > 50) return nlpResult.data;

  // Step 3: Fallback ke AI lokal
  return await parseWithAI(cleanText);
}