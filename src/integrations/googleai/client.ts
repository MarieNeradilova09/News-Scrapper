/**
 * Google AI Studio API Client
 * Produkční integrace s Google AI (Gemini 1.5 Flash) pro zpracování článků
 */

const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface GoogleAIArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  keyTopics: string[];
  audioUrl?: string;
  processedAt: string;
}

export interface GoogleAIResponse {
  success: boolean;
  data?: {
    summary: string;
    sentiment: string;
    key_topics: string[];
    audio_url?: string;
    processed_at: string;
  };
  error?: string;
}

/**
 * Google AI API client pro produkční použití
 */
export const googleAI = {
  /**
   * Zpracuje článek pomocí Google AI (Gemini Pro)
   */
  async processArticle(article: {
    id: string;
    title: string;
    content: string;
    category: string;
    source_url: string;
  }): Promise<GoogleAIResponse> {
    try {
      console.log(`🔄 Zpracovávám článek pomocí Google AI: ${article.title}`);
      
      const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
      if (!apiKey) {
        throw new Error('Google AI API klíč není nastaven');
      }

      // 1. Generování shrnutí
      const summary = await this.generateSummary(article.title, article.content, apiKey);
      
      // 2. Analýza sentimentu
      const sentiment = await this.analyzeSentiment(article.content, apiKey);
      
      // 3. Extrakce klíčových témat
      const keyTopics = await this.extractKeyTopics(article.content, apiKey);
      
      const result: GoogleAIResponse = {
        success: true,
        data: {
          summary,
          sentiment,
          key_topics: keyTopics,
          processed_at: new Date().toISOString()
        }
      };
      
      console.log(`✅ Článek zpracován Google AI: ${article.title}`);
      return result;
      
    } catch (error) {
      console.error('❌ Chyba při zpracování článku Google AI:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Neznámá chyba'
      };
    }
  },

  /**
   * Generuje shrnutí článku pomocí Gemini 1.5 Flash
   */
  async generateSummary(title: string, content: string, apiKey: string): Promise<string> {
    const prompt = `Shrň tento článek do 2-3 vět v češtině, zachovej klíčové informace:

Název: ${title}

Obsah: ${content}`;

    const response = await fetch(GOOGLE_AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.3
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Shrnutí nebylo vygenerováno';
  },

  /**
   * Analyzuje sentiment článku pomocí Gemini 1.5 Flash
   */
  async analyzeSentiment(content: string, apiKey: string): Promise<string> {
    const prompt = `Analyzuj sentiment tohoto článku a odpověz pouze jedním slovem: positive, negative, nebo neutral:

${content}`;

    const response = await fetch(GOOGLE_AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: 10,
          temperature: 0.1
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const sentiment = data.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase().trim();
    
    // Validace sentimentu
    if (['positive', 'negative', 'neutral'].includes(sentiment)) {
      return sentiment;
    }
    
    return 'neutral';
  },

  /**
   * Extrahuje klíčová témata pomocí Gemini 1.5 Flash
   */
  async extractKeyTopics(content: string, apiKey: string): Promise<string[]> {
    const prompt = `Vytáhni 3-5 klíčových témat z tohoto článku a odpověz jako JSON array:

${content}`;

    const response = await fetch(GOOGLE_AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.2
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const topicsText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    try {
      // Pokus o parsování JSON
      const topics = JSON.parse(topicsText);
      return Array.isArray(topics) ? topics.slice(0, 5) : [];
    } catch (error) {
      // Fallback - rozdělí text na slova
      console.log('JSON parsing failed, using fallback');
      return topicsText
        ?.split(/[,\n]/)
        .map(topic => topic.trim())
        .filter(topic => topic.length > 0)
        .slice(0, 5) || [];
    }
  },

  /**
   * Testuje připojení k Google AI API
   */
  async testConnection(): Promise<boolean> {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
      if (!apiKey) {
        console.error('❌ Google AI API klíč není nastaven');
        return false;
      }

      const response = await fetch(GOOGLE_AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Test připojení k Google AI API'
            }]
          }],
          generationConfig: {
            maxOutputTokens: 10
          }
        })
      });

      const isConnected = response.ok;
      console.log(isConnected ? '✅ Google AI API připojení OK' : '❌ Google AI API připojení selhalo');
      return isConnected;
      
    } catch (error) {
      console.error('❌ Chyba při testování Google AI API:', error);
      return false;
    }
  }
};

export default googleAI;
