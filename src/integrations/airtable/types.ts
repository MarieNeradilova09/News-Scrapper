// Airtable Types for Frontend

export interface AirtableRecord<T> {
  id: string;
  fields: T;
  createdTime?: string;
}

// Article Types
export interface AirtableArticleFields {
  Source_ID?: string;
  Title: string;
  Content?: string;
  Summary: string;
  Audio_URL?: string;
  Published_At: string;
  Processed_At?: string;
  Category: string;
  Status: 'New' | 'Processed' | 'Error';
  Original_URL?: string;
  Created_At?: string;
}

export type AirtableArticle = AirtableRecord<AirtableArticleFields>;

// Source Types
export interface AirtableSourceFields {
  Name: string;
  URL: string;
  Category: string;
  Active: boolean;
  Last_Scraped?: string;
  Scraping_Interval?: number;
  Selector?: string;
  Created_At?: string;
}

export type AirtableSource = AirtableRecord<AirtableSourceFields>;

// Digest Types
export interface AirtableDigestFields {
  Date: string;
  Articles_Count: number;
  Summary: string;
  Audio_URL?: string;
  Status: 'Generating' | 'Ready' | 'Error';
  Articles_IDs?: string;
  Created_At?: string;
}

export type AirtableDigest = AirtableRecord<AirtableDigestFields>;

// API Response Types
export interface AirtableListResponse<T> {
  records: T[];
  offset?: string;
}

export interface AirtableCreateResponse<T> {
  id: string;
  fields: T;
  createdTime: string;
}

export interface AirtableUpdateResponse<T> {
  id: string;
  fields: T;
  createdTime: string;
}

// Filter Types
export interface ArticleFilters {
  status?: 'New' | 'Processed' | 'Error';
  category?: string;
  limit?: number;
  sortBy?: keyof AirtableArticleFields;
  sortDirection?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

export interface SourceFilters {
  active?: boolean;
  category?: string;
  limit?: number;
  sortBy?: keyof AirtableSourceFields;
  sortDirection?: 'asc' | 'desc';
}

export interface DigestFilters {
  status?: 'Generating' | 'Ready' | 'Error';
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  sortBy?: keyof AirtableDigestFields;
  sortDirection?: 'asc' | 'desc';
}

// Statistics Types
export interface ProcessingStats {
  totalArticles: number;
  processedArticles: number;
  pendingArticles: number;
  errorArticles: number;
  totalSources: number;
  activeSources: number;
  totalDigests: number;
  processingRate: number; // percentage
  lastProcessed?: string;
}

// Category Types
export type ArticleCategory = 
  | 'Technology'
  | 'Business'
  | 'News'
  | 'Science'
  | 'Health'
  | 'Sports'
  | 'Entertainment'
  | 'Politics'
  | 'General';

export type ProcessingStatus = 'New' | 'Processed' | 'Error';
export type DigestStatus = 'Generating' | 'Ready' | 'Error';

// Form Types for UI
export interface CreateArticleForm {
  title: string;
  content: string;
  category: ArticleCategory;
  originalUrl?: string;
  sourceId?: string;
}

export interface CreateSourceForm {
  name: string;
  url: string;
  category: ArticleCategory;
  active: boolean;
  scrapingInterval?: number;
  selector?: string;
}

export interface UpdateArticleForm {
  title?: string;
  content?: string;
  summary?: string;
  category?: ArticleCategory;
  status?: ProcessingStatus;
  audioUrl?: string;
}

export interface UpdateSourceForm {
  name?: string;
  url?: string;
  category?: ArticleCategory;
  active?: boolean;
  scrapingInterval?: number;
  selector?: string;
}

// Audio Types
export interface AudioMetadata {
  url: string;
  duration?: number;
  size?: number;
  format?: string;
  voice?: string;
  generatedAt?: string;
}

// Search Types
export interface SearchFilters {
  query?: string;
  category?: ArticleCategory;
  status?: ProcessingStatus;
  dateFrom?: string;
  dateTo?: string;
  hasAudio?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchResults<T> {
  records: T[];
  totalCount: number;
  hasMore: boolean;
  offset?: string;
}

// Error Types
export interface AirtableError {
  error: {
    type: string;
    message: string;
  };
}

// Webhook Types (for Make.com integration)
export interface WebhookPayload {
  action: 'create' | 'update' | 'delete';
  record: AirtableArticle | AirtableSource | AirtableDigest;
  timestamp: string;
}

// Processing Result Types
export interface ProcessingResult {
  status: 'success' | 'partial_success' | 'error';
  processed: number;
  errors: number;
  total: number;
  digestCreated: boolean;
  timestamp: string;
  message?: string;
}

// Export all types
export type {
  AirtableRecord,
  AirtableArticleFields,
  AirtableSourceFields,
  AirtableDigestFields,
  AirtableListResponse,
  AirtableCreateResponse,
  AirtableUpdateResponse,
  ArticleFilters,
  SourceFilters,
  DigestFilters,
  ProcessingStats,
  CreateArticleForm,
  CreateSourceForm,
  UpdateArticleForm,
  UpdateSourceForm,
  AudioMetadata,
  SearchFilters,
  SearchResults,
  AirtableError,
  WebhookPayload,
  ProcessingResult
};
