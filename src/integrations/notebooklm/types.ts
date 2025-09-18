/**
 * NotebookLM Types
 * TypeScript definice pro NotebookLM integraci
 */

export interface NotebookLMArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  summary: string;
  keyTopics: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  processedAt: string;
}

export interface NotebookLMResponse {
  articles: NotebookLMArticle[];
  totalCount: number;
  processingTime: number;
}

export interface NotebookLMSummary {
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

export interface NotebookLMSearchResult {
  query: string;
  articles: NotebookLMArticle[];
  totalResults: number;
  searchTime: number;
}

export interface NotebookLMProcessingStats {
  totalProcessed: number;
  lastProcessed: string;
  averageProcessingTime: number;
  successRate: number;
}
