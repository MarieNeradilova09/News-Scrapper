/**
 * NotebookLM Wrapper API
 * Simuluje NotebookLM funkcionalitu pomocí Google AI Studio API
 */

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Google AI konfigurace
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

/**
 * Zpracuje článek podobně jako NotebookLM
 */
app.post('/process-article', async (req, res) => {
  try {
    const { article_id, title, content, category, source_url, language = 'cs' } = req.body;
    
    console.log(`🔄 Zpracovávám článek: ${title}`);
    
    // 1. Generování shrnutí
    const summary = await generateSummary(content, language);
    
    // 2. Analýza sentimentu
    const sentiment = await analyzeSentiment(content, language);
    
    // 3. Extrakce klíčových témat
    const keyTopics = await extractKeyTopics(content, language);
    
    // 4. Generování audio (simulace)
    const audioUrl = await generateAudioUrl(summary);
    
    const result = {
      success: true,
      data: {
        summary,
        sentiment,
        key_topics: keyTopics,
        audio_url: audioUrl,
        processed_at: new Date().toISOString(),
        processing_time: Math.random() * 30 + 15 // 15-45 sekund
      }
    };
    
    console.log(`✅ Článek zpracován: ${title}`);
    res.json(result);
    
  } catch (error) {
    console.error('❌ Chyba při zpracování článku:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Generuje shrnutí článku
 */
async function generateSummary(content, language) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = language === 'cs' 
    ? `Shrň tento článek do 2-3 vět v češtině, zachovej klíčové informace:\n\n${content}`
    : `Summarize this article in 2-3 sentences, keep key information:\n\n${content}`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

/**
 * Analyzuje sentiment článku
 */
async function analyzeSentiment(content, language) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = language === 'cs'
    ? `Analyzuj sentiment tohoto článku a odpověz pouze jedním slovem: positive, negative, nebo neutral:\n\n${content}`
    : `Analyze the sentiment of this article and respond with only one word: positive, negative, or neutral:\n\n${content}`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const sentiment = response.text().toLowerCase().trim();
  
  return ['positive', 'negative', 'neutral'].includes(sentiment) ? sentiment : 'neutral';
}

/**
 * Extrahuje klíčová témata
 */
async function extractKeyTopics(content, language) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = language === 'cs'
    ? `Vytáhni 3-5 klíčových témat z tohoto článku a odpověz jako JSON array:\n\n${content}`
    : `Extract 3-5 key topics from this article and respond as JSON array:\n\n${content}`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  try {
    return JSON.parse(response.text());
  } catch (error) {
    // Fallback - rozdělí text na slova
    return content.split(' ').slice(0, 5);
  }
}

/**
 * Generuje URL pro audio (simulace)
 */
async function generateAudioUrl(summary) {
  // Simulace - v reálné implementaci by toto bylo skutečné audio generování
  const audioId = Math.random().toString(36).substring(7);
  return `https://notebooklm-wrapper.audio/${audioId}.mp3`;
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * Získá status zpracování článku
 */
app.get('/articles/:articleId/status', (req, res) => {
  const { articleId } = req.params;
  
  // Simulace statusu
  res.json({
    article_id: articleId,
    status: 'processed',
    processed_at: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 NotebookLM Wrapper API běží na portu ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔄 Process article: POST http://localhost:${PORT}/process-article`);
});

module.exports = app;
