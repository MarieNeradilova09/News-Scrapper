// Kompletní pipeline processor pro denní digest
import { scrapeSources, TEST_SOURCES, type ScrapedArticle } from './scraper';
import { processArticles, type AIProcessingResult } from './aiProcessor';
import { generateArticleAudio, generateDigestAudio, type TTSResult } from './ttsProcessor';

export interface ProcessedArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  keyPoints: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  audioUrl: string;
  audioDuration: number;
  publishedAt: string;
  source: string;
  originalUrl: string;
  processedAt: string;
}

export interface DailyDigest {
  id: string;
  date: string;
  articlesCount: number;
  summary: string;
  audioUrl: string;
  audioDuration: number;
  articles: ProcessedArticle[];
  createdAt: string;
}

export interface PipelineProgress {
  step: string;
  progress: number;
  total: number;
  current: number;
  message: string;
}

export interface PipelineResult {
  success: boolean;
  digest: DailyDigest | null;
  articles: ProcessedArticle[];
  errors: string[];
  duration: number;
}

// Hlavní pipeline funkce
export const runDailyPipeline = async (
  onProgress?: (progress: PipelineProgress) => void
): Promise<PipelineResult> => {
  const startTime = Date.now();
  const errors: string[] = [];
  let processedArticles: ProcessedArticle[] = [];
  
  try {
    // Krok 1: Scraping
    onProgress?.({
      step: 'scraping',
      progress: 10,
      total: 100,
      current: 1,
      message: 'Načítám články ze zdrojů...'
    });
    
    const scrapedArticles = await scrapeSources(TEST_SOURCES);
    
    onProgress?.({
      step: 'scraping',
      progress: 20,
      total: 100,
      current: scrapedArticles.length,
      message: `Načteno ${scrapedArticles.length} článků`
    });
    
    // Krok 2: AI zpracování
    onProgress?.({
      step: 'ai_processing',
      progress: 30,
      total: 100,
      current: 0,
      message: 'Zpracovávám články pomocí AI...'
    });
    
    const articlesForProcessing = scrapedArticles.map(article => ({
      content: article.content,
      title: article.title
    }));
    
    const aiResults = await processArticles(articlesForProcessing);
    
    onProgress?.({
      step: 'ai_processing',
      progress: 50,
      total: 100,
      current: aiResults.length,
      message: `Zpracováno ${aiResults.length} článků`
    });
    
    // Krok 3: Generování audio
    onProgress?.({
      step: 'audio_generation',
      progress: 60,
      total: 100,
      current: 0,
      message: 'Generuji audio pro články...'
    });
    
    for (let i = 0; i < scrapedArticles.length; i++) {
      const article = scrapedArticles[i];
      const aiResult = aiResults[i];
      
      try {
        const audioResult = await generateArticleAudio(
          article.title,
          aiResult.summary,
          aiResult.category
        );
        
        const processedArticle: ProcessedArticle = {
          id: `article_${Date.now()}_${i}`,
          title: article.title,
          content: article.content,
          summary: aiResult.summary,
          category: aiResult.category,
          tags: aiResult.tags,
          keyPoints: aiResult.keyPoints,
          sentiment: aiResult.sentiment,
          audioUrl: audioResult.audioUrl,
          audioDuration: audioResult.duration,
          publishedAt: article.publishedAt,
          source: article.source,
          originalUrl: article.url,
          processedAt: new Date().toISOString()
        };
        
        processedArticles.push(processedArticle);
        
        onProgress?.({
          step: 'audio_generation',
          progress: 60 + (i + 1) / scrapedArticles.length * 20,
          total: 100,
          current: i + 1,
          message: `Vygenerováno audio pro ${i + 1}/${scrapedArticles.length} článků`
        });
        
      } catch (error) {
        console.error(`Error processing article ${i}:`, error);
        errors.push(`Chyba při zpracování článku: ${article.title}`);
      }
    }
    
    // Krok 4: Generování digest
    onProgress?.({
      step: 'digest_generation',
      progress: 85,
      total: 100,
      current: 0,
      message: 'Generuji denní digest...'
    });
    
    const digestArticles = processedArticles.map(article => ({
      title: article.title,
      summary: article.summary
    }));
    
    const digestAudio = await generateDigestAudio(digestArticles);
    
    const digestSummary = `Dnešní digest obsahuje ${processedArticles.length} článků z kategorií: ${
      [...new Set(processedArticles.map(a => a.category))].join(', ')
    }.`;
    
    const dailyDigest: DailyDigest = {
      id: `digest_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      articlesCount: processedArticles.length,
      summary: digestSummary,
      audioUrl: digestAudio.audioUrl,
      audioDuration: digestAudio.duration,
      articles: processedArticles,
      createdAt: new Date().toISOString()
    };
    
    onProgress?.({
      step: 'digest_generation',
      progress: 100,
      total: 100,
      current: 1,
      message: 'Digest je připraven!'
    });
    
    const duration = Date.now() - startTime;
    
    return {
      success: true,
      digest: dailyDigest,
      articles: processedArticles,
      errors,
      duration
    };
    
  } catch (error) {
    console.error('Pipeline error:', error);
    errors.push(`Chyba v pipeline: ${error}`);
    
    const duration = Date.now() - startTime;
    
    return {
      success: false,
      digest: null,
      articles: processedArticles,
      errors,
      duration
    };
  }
};

// Funkce pro uložení do Supabase (připraveno pro budoucí integraci)
export const saveToSupabase = async (digest: DailyDigest): Promise<boolean> => {
  try {
    // TODO: Implementovat uložení do Supabase
    console.log('Saving to Supabase:', digest);
    return true;
  } catch (error) {
    console.error('Error saving to Supabase:', error);
    return false;
  }
};

// Funkce pro uložení do Airtable (připraveno pro Make integraci)
export const saveToAirtable = async (digest: DailyDigest): Promise<boolean> => {
  try {
    // TODO: Implementovat uložení do Airtable přes Make webhook
    console.log('Saving to Airtable:', digest);
    return true;
  } catch (error) {
    console.error('Error saving to Airtable:', error);
    return false;
  }
};

// Funkce pro formátování času
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

// Funkce pro formátování velikosti
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};
