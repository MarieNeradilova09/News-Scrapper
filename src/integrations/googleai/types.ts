/**
 * Google AI Types
 * TypeScript definice pro Google AI (Gemini Pro) integraci
 */

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

export interface GoogleAISummary {
  totalArticles: number;
  mainTopics: string[];
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  keyInsights: string[];
  generatedAt: string;
}

export interface GoogleAISearchResult {
  query: string;
  articles: GoogleAIArticle[];
  totalResults: number;
  searchTime: number;
}

export interface GoogleAIProcessingStats {
  totalProcessed: number;
  lastProcessed: string;
  averageProcessingTime: number;
  successRate: number;
  apiUsage: {
    requestsToday: number;
    tokensUsed: number;
    remainingQuota: number;
  };
}

export interface GoogleAIConfig {
  apiKey: string;
  projectId?: string;
  model: 'gemini-pro' | 'gemini-pro-vision';
  maxTokens: number;
  temperature: number;
  retryAttempts: number;
  timeout: number;
}

export interface GoogleAIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}
