// Text-to-Speech processing utility
export interface TTSResult {
  audioUrl: string;
  duration: number;
  voice: string;
  text: string;
  format: 'mp3' | 'wav' | 'ogg';
}

export interface TTSConfig {
  voice: string;
  speed: number;
  pitch: number;
  format: 'mp3' | 'wav' | 'ogg';
  quality: 'low' | 'medium' | 'high';
}

// Dostupné hlasy pro různé kategorie
export const VOICE_MAPPING = {
  'Tech': 'Rachel',
  'Business': 'Adam',
  'News': 'Sarah',
  'General': 'Rachel',
  'default': 'Rachel'
};

// Simulace ElevenLabs API (pro testování)
export const simulateTTS = async (text: string, config: TTSConfig): Promise<TTSResult> => {
  // Simulace delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Mock TTS response
  const mockResult: TTSResult = {
    audioUrl: `https://mock-audio-url.com/audio-${Date.now()}.mp3`,
    duration: Math.ceil(text.length / 15), // Přibližně 15 znaků za sekundu
    voice: config.voice,
    text: text,
    format: config.format
  };
  
  return mockResult;
};

// Funkce pro generování audio z textu
export const generateAudio = async (text: string, category: string = 'General'): Promise<TTSResult> => {
  const voice = VOICE_MAPPING[category as keyof typeof VOICE_MAPPING] || VOICE_MAPPING.default;
  
  const config: TTSConfig = {
    voice: voice,
    speed: 1.0,
    pitch: 1.0,
    format: 'mp3',
    quality: 'high'
  };
  
  try {
    const result = await simulateTTS(text, config);
    return result;
  } catch (error) {
    console.error('Error generating audio:', error);
    throw new Error('Nepodařilo se vygenerovat audio');
  }
};

// Funkce pro generování audio z článku
export const generateArticleAudio = async (title: string, summary: string, category: string): Promise<TTSResult> => {
  const fullText = `${title}. ${summary}`;
  return generateAudio(fullText, category);
};

// Funkce pro generování digest audio
export const generateDigestAudio = async (articles: Array<{title: string, summary: string}>): Promise<TTSResult> => {
  const digestText = `Dnešní digest obsahuje ${articles.length} článků. ` +
    articles.map((article, index) => 
      `${index + 1}. ${article.title}. ${article.summary}`
    ).join(' ');
  
  return generateAudio(digestText, 'General');
};

// Funkce pro batch generování audio
export const generateMultipleAudio = async (
  texts: Array<{text: string, category: string}>
): Promise<TTSResult[]> => {
  const results: TTSResult[] = [];
  
  for (const item of texts) {
    try {
      const result = await generateAudio(item.text, item.category);
      results.push(result);
    } catch (error) {
      console.error('Error generating audio for text:', error);
      // Přidáme fallback result
      results.push({
        audioUrl: '',
        duration: 0,
        voice: 'default',
        text: item.text,
        format: 'mp3'
      });
    }
  }
  
  return results;
};

// Funkce pro optimalizaci textu pro TTS
export const optimizeTextForTTS = (text: string): string => {
  return text
    .replace(/[^\w\s.,!?]/g, '') // Odstraní speciální znaky
    .replace(/\s+/g, ' ') // Normalizuje mezery
    .replace(/([.!?])\s*([A-Z])/g, '$1 $2') // Přidá mezery za interpunkci
    .trim();
};

// Funkce pro rozdělení dlouhého textu
export const splitLongText = (text: string, maxLength: number = 1000): string[] => {
  if (text.length <= maxLength) {
    return [text];
  }
  
  const sentences = text.split(/[.!?]+/);
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      }
    } else {
      currentChunk += sentence + '. ';
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
};

// Funkce pro generování audio s rozdělením
export const generateLongAudio = async (text: string, category: string): Promise<TTSResult[]> => {
  const optimizedText = optimizeTextForTTS(text);
  const chunks = splitLongText(optimizedText);
  
  const results: TTSResult[] = [];
  
  for (const chunk of chunks) {
    try {
      const result = await generateAudio(chunk, category);
      results.push(result);
    } catch (error) {
      console.error('Error generating audio chunk:', error);
    }
  }
  
  return results;
};
