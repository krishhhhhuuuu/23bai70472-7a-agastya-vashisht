import { Router } from 'express';
import multer from 'multer';
import Groq from 'groq-sdk';
import { verifyToken, requireTeacher } from '../middleware/auth.js';

const router = Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Store files in memory (we process them immediately)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/* ============================================================
   POST /api/syllabus/parse-text
   Parse plain text syllabus into structured units
   Body: { text, subjectName }
============================================================ */
router.post('/parse-text', verifyToken, requireTeacher, async (req, res) => {
  const { text, subjectName = 'Subject' } = req.body;
  if (!text || text.trim().length < 10) {
    return res.status(400).json({ error: 'Please provide syllabus text' });
  }
  try {
    const structured = await parseSyllabusText(text, subjectName);
    res.json({ success: true, ...structured });
  } catch (err) {
    console.error('Parse text error:', err);
    res.status(500).json({ error: 'Failed to parse syllabus: ' + err.message });
  }
});

/* ============================================================
   POST /api/syllabus/parse-image
   Parse image of syllabus using Groq vision
   Body: { imageBase64, mimeType, subjectName }
============================================================ */
router.post('/parse-image', verifyToken, requireTeacher, async (req, res) => {
  const { imageBase64, mimeType = 'image/jpeg', subjectName = 'Subject' } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: 'No image data provided' });
  }
  try {
    const extracted = await extractTextFromImage(imageBase64, mimeType);
    const structured = await parseSyllabusText(extracted, subjectName);
    res.json({ success: true, extractedText: extracted, ...structured });
  } catch (err) {
    console.error('Parse image error:', err);
    res.status(500).json({ error: 'Failed to process image: ' + err.message });
  }
});

/* ============================================================
   POST /api/syllabus/parse-document
   Parse uploaded PDF/DOCX/TXT file
   Multipart: file field + subjectName field
============================================================ */
router.post('/parse-document', verifyToken, requireTeacher, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const subjectName = req.body.subjectName || 'Subject';
  const mime = req.file.mimetype;

  try {
    let text = '';

    if (mime === 'text/plain') {
      text = req.file.buffer.toString('utf-8');
    } else if (mime === 'application/pdf') {
      // Dynamic import to avoid issues if pdf-parse has trouble
      const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
      const data = await pdfParse(req.file.buffer);
      text = data.text;
    } else if (
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mime === 'application/msword'
    ) {
      // For DOCX, extract raw text from XML
      text = await extractDocxText(req.file.buffer);
    } else {
      // Try treating as plain text
      text = req.file.buffer.toString('utf-8');
    }

    if (!text || text.trim().length < 10) {
      return res.status(400).json({ error: 'Could not extract text from document. Try copy-pasting the text instead.' });
    }

    const structured = await parseSyllabusText(text, subjectName);
    res.json({ success: true, extractedText: text.substring(0, 500), ...structured });
  } catch (err) {
    console.error('Parse document error:', err);
    res.status(500).json({ error: 'Failed to process document: ' + err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

async function extractTextFromImage(base64, mimeType) {
  // Use Groq's vision model to extract text from image
  const completion = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${base64}` },
          },
          {
            type: 'text',
            text: 'Extract ALL text from this syllabus image. Preserve the structure, unit names, topics, and any numbering. Return only the extracted text, nothing else.',
          },
        ],
      },
    ],
    temperature: 0.1,
    max_tokens: 4000,
  });
  return completion.choices[0].message.content.trim();
}

async function parseSyllabusText(text, subjectName) {
  const prompt = `You are an expert at parsing academic syllabi. Analyze this syllabus and extract a structured breakdown.

Subject: ${subjectName}
Syllabus Text:
"""
${text.substring(0, 8000)}
"""

Return ONLY valid JSON in this exact format:
{
  "fullSyllabus": "cleaned and formatted version of the full syllabus text",
  "units": [
    {
      "name": "Unit 1: Introduction",
      "order": 1,
      "topics": ["Topic 1", "Topic 2"],
      "content": "Full content/description of this unit including all topics"
    }
  ],
  "summary": "2-3 sentence overview of what this syllabus covers"
}

Rules:
- Extract ALL units/chapters/modules (look for patterns like Unit 1, Chapter 1, Module 1, Section 1, etc.)
- If no clear units exist, create logical groupings based on topics
- Each unit's "content" should include all its topics and subtopics as a readable paragraph
- Minimum 1 unit, maximum 20 units
- Return ONLY the JSON, no markdown`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });

  const parsed = JSON.parse(completion.choices[0].message.content.trim());

  if (!parsed.units || !Array.isArray(parsed.units)) {
    throw new Error('AI could not identify units in the syllabus');
  }

  return {
    fullSyllabus: parsed.fullSyllabus || text,
    units: parsed.units.map((u, i) => ({
      name: u.name || `Unit ${i + 1}`,
      order: u.order || i + 1,
      topics: u.topics || [],
      content: u.content || u.name,
    })),
    summary: parsed.summary || '',
  };
}

async function extractDocxText(buffer) {
  // Simple DOCX text extraction by reading the XML inside the zip
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(buffer);
  const xmlFile = zip.file('word/document.xml');
  if (!xmlFile) throw new Error('Invalid DOCX file');
  const xml = await xmlFile.async('string');
  // Strip XML tags and decode entities
  return xml
    .replace(/<w:br[^>]*\/>/g, '\n')
    .replace(/<w:p[ >][^>]*>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x[0-9A-Fa-f]+;/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export default router;
