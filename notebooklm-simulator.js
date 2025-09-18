/**
 * NotebookLM Simulator
 * Simuluje NotebookLM funkcionalitu bez API klíče
 * Používá lokální AI modely nebo free API
 */

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Simuluje NotebookLM zpracování článku
 * Bez potřeby API klíče
 */
app.post('/process-article', async (req, res) => {
  try {
    const { article_id, title, content, category, source_url, language = 'cs' } = req.body;
    
    console.log(`🔄 Simuluji NotebookLM zpracování: ${title}`);
    
    // Simulace zpracování (2-5 sekund)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 2000));
    
    // Generování simulovaných výsledků
    const result = {
      success: true,
      data: {
        summary: generateMockSummary(content, language),
        sentiment: analyzeMockSentiment(content),
        key_topics: extractMockTopics(content),
        audio_url: generateMockAudioUrl(),
        processed_at: new Date().toISOString(),
        processing_time: Math.random() * 30 + 15
      }
    };
    
    console.log(`✅ Simulace dokončena: ${title}`);
    res.json(result);
    
  } catch (error) {
    console.error('❌ Chyba při simulaci:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Generuje mock shrnutí
 */
function generateMockSummary(content, language) {
  const sentences = content.split('.').slice(0, 3);
  const summary = sentences.join('.') + '.';
  
  if (language === 'cs') {
    return `Shrnutí: ${summary} Tento článek obsahuje důležité informace o daném tématu.`;
  }
  
  return `Summary: ${summary} This article contains important information about the topic.`;
}

/**
 * Analyzuje mock sentiment
 */
function analyzeMockSentiment(content) {
  const positiveWords = ['dobrý', 'výborný', 'úspěch', 'růst', 'pozitivní', 'výhoda'];
  const negativeWords = ['špatný', 'problém', 'krize', 'pokles', 'negativní', 'nevýhoda'];
  
  const lowerContent = content.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

/**
 * Extrahuje mock témata
 */
function extractMockTopics(content) {
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 4)
    .filter(word => !['tento', 'který', 'když', 'proto', 'také'].includes(word));
  
  // Vezme 3-5 nejčastějších slov
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

/**
 * Generuje mock audio URL
 */
function generateMockAudioUrl() {
  const audioId = Math.random().toString(36).substring(7);
  return `https://mock-notebooklm.audio/${audioId}.mp3`;
}

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'NotebookLM Simulator',
    timestamp: new Date().toISOString() 
  });
});

/**
 * Získá status článku
 */
app.get('/articles/:articleId/status', (req, res) => {
  const { articleId } = req.params;
  
  res.json({
    article_id: articleId,
    status: 'processed',
    processed_at: new Date().toISOString(),
    service: 'NotebookLM Simulator'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 NotebookLM Simulator běží na portu ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔄 Process article: POST http://localhost:${PORT}/process-article`);
  console.log(`💡 Toto je simulace - žádný API klíč není potřeba!`);
});

module.exports = app;
