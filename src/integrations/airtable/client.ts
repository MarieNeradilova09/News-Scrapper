// Airtable API Client for Frontend
import { toast } from "@/hooks/use-toast";

// Types
export interface AirtableArticle {
  id: string;
  fields: {
    Source_ID?: string;
    Title?: string;
    Content?: string;
    Summary?: string;
    Audio_URL?: string;
    Published_At?: string;
    Processed_At?: string;
    Category?: string;
    Status?: 'New' | 'Processed' | 'Error';
    Original_URL?: string;
    Created_At?: string;
  };
}

export interface AirtableSource {
  id: string;
  fields: {
    Name: string;
    URL: string;
    Category: string;
    Active: boolean;
    Last_Scraped?: string;
    Scraping_Interval?: number;
    Selector?: string;
    Created_At?: string;
  };
}

export interface AirtableDigest {
  id: string;
  fields: {
    Date: string;
    Articles_Count: number;
    Summary: string;
    Audio_URL?: string;
    Status: 'Generating' | 'Ready' | 'Error';
    Articles_IDs?: string;
    Created_At?: string;
  };
}

// Configuration
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.warn('Airtable API credentials not configured');
}

// Base API configuration
const API_BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;
const DEFAULT_HEADERS = {
  'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
};

// Utility functions
const handleApiError = (error: any, operation: string) => {
  console.error(`Airtable API Error (${operation}):`, error);
  console.error('Error details:', {
    message: error.message,
    status: error.status,
    statusText: error.statusText,
    url: error.url
  });
  
  toast({
    title: "Chyba při komunikaci s databází",
    description: `Nepodařilo se ${operation.toLowerCase()}: ${error.message}`,
    variant: "destructive"
  });
  throw error;
};

const makeRequest = async (url: string, options: RequestInit = {}) => {
  try {
    console.log('🌐 Airtable API Request:', { url, options });
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...DEFAULT_HEADERS,
        ...options.headers,
      },
    });

    console.log('📡 Airtable API Response:', { 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok 
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Airtable API Error Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Airtable API Success:', { recordCount: data.records?.length || 0 });
    return data;
  } catch (error) {
    console.error('💥 Airtable API Request Failed:', error);
    throw error;
  }
};

// Articles API
export const articlesApi = {
  // Get all articles with optional filtering
  async getAll(filters?: {
    status?: string;
    category?: string;
    limit?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Promise<AirtableArticle[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) {
        params.append('filterByFormula', `{Status} = '${filters.status}'`);
      }
      
      if (filters?.category) {
        params.append('filterByFormula', `{Category} = '${filters.category}'`);
      }
      
      if (filters?.limit) {
        params.append('maxRecords', filters.limit.toString());
      }
      
      if (filters?.sortBy) {
        const direction = filters.sortDirection || 'desc';
        params.append('sort[0][field]', filters.sortBy);
        params.append('sort[0][direction]', direction);
      }

      const url = `${API_BASE_URL}/Articles?${params.toString()}`;
      const response = await makeRequest(url);
      
      return response.records || [];
    } catch (error) {
      handleApiError(error, 'načtení článků');
      return [];
    }
  },

  // Get article by ID
  async getById(id: string): Promise<AirtableArticle | null> {
    try {
      const url = `${API_BASE_URL}/Articles/${id}`;
      const response = await makeRequest(url);
      return response;
    } catch (error) {
      handleApiError(error, 'načtení článku');
      return null;
    }
  },

  // Get recent articles (all articles, sorted by creation date)
  async getRecent(limit: number = 20): Promise<AirtableArticle[]> {
    try {
      const params = new URLSearchParams({
        maxRecords: limit.toString(),
        'sort[0][field]': 'Created_At',
        'sort[0][direction]': 'desc'
      });

      const url = `${API_BASE_URL}/Articles?${params.toString()}`;
      const response = await makeRequest(url);
      
      return response.records || [];
    } catch (error) {
      handleApiError(error, 'načtení nedávných článků');
      return [];
    }
  },

  // Get articles by category
  async getByCategory(category: string, limit: number = 10): Promise<AirtableArticle[]> {
    try {
      const params = new URLSearchParams({
        filterByFormula: `{Category} = '${category}'`,
        maxRecords: limit.toString(),
        'sort[0][field]': 'Published_At',
        'sort[0][direction]': 'desc'
      });

      const url = `${API_BASE_URL}/Articles?${params.toString()}`;
      const response = await makeRequest(url);
      
      return response.records || [];
    } catch (error) {
      handleApiError(error, 'načtení článků podle kategorie');
      return [];
    }
  },

  // Create new article
  async create(articleData: Partial<AirtableArticle['fields']>): Promise<AirtableArticle | null> {
    try {
      const url = `${API_BASE_URL}/Articles`;
      const response = await makeRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          fields: articleData
        })
      });
      
      toast({
        title: "Článek vytvořen",
        description: "Článek byl úspěšně přidán do databáze"
      });
      
      return response;
    } catch (error) {
      handleApiError(error, 'vytvoření článku');
      return null;
    }
  },

  // Update article
  async update(id: string, updates: Partial<AirtableArticle['fields']>): Promise<AirtableArticle | null> {
    try {
      const url = `${API_BASE_URL}/Articles/${id}`;
      const response = await makeRequest(url, {
        method: 'PATCH',
        body: JSON.stringify({
          fields: updates
        })
      });
      
      toast({
        title: "Článek aktualizován",
        description: "Změny byly úspěšně uloženy"
      });
      
      return response;
    } catch (error) {
      handleApiError(error, 'aktualizace článku');
      return null;
    }
  }
};

// Sources API
export const sourcesApi = {
  // Get all active sources
  async getActive(): Promise<AirtableSource[]> {
    try {
      const params = new URLSearchParams({
        filterByFormula: '{Active} = TRUE()',
        'sort[0][field]': 'Name',
        'sort[0][direction]': 'asc'
      });

      const url = `${API_BASE_URL}/Sources?${params.toString()}`;
      const response = await makeRequest(url);
      
      return response.records || [];
    } catch (error) {
      handleApiError(error, 'načtení zdrojů');
      return [];
    }
  },

  // Get all sources
  async getAll(): Promise<AirtableSource[]> {
    try {
      const url = `${API_BASE_URL}/Sources`;
      const response = await makeRequest(url);
      
      return response.records || [];
    } catch (error) {
      handleApiError(error, 'načtení všech zdrojů');
      return [];
    }
  },

  // Create new source
  async create(sourceData: Partial<AirtableSource['fields']>): Promise<AirtableSource | null> {
    try {
      const url = `${API_BASE_URL}/Sources`;
      const response = await makeRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          fields: sourceData
        })
      });
      
      toast({
        title: "Zdroj vytvořen",
        description: "Nový zdroj byl úspěšně přidán"
      });
      
      return response;
    } catch (error) {
      handleApiError(error, 'vytvoření zdroje');
      return null;
    }
  },

  // Update source
  async update(id: string, updates: Partial<AirtableSource['fields']>): Promise<AirtableSource | null> {
    try {
      const url = `${API_BASE_URL}/Sources/${id}`;
      const response = await makeRequest(url, {
        method: 'PATCH',
        body: JSON.stringify({
          fields: updates
        })
      });
      
      toast({
        title: "Zdroj aktualizován",
        description: "Změny byly úspěšně uloženy"
      });
      
      return response;
    } catch (error) {
      handleApiError(error, 'aktualizace zdroje');
      return null;
    }
  }
};

// Digests API
export const digestsApi = {
  // Get latest digest
  async getLatest(): Promise<AirtableDigest | null> {
    try {
      const params = new URLSearchParams({
        maxRecords: '1',
        'sort[0][field]': 'Date',
        'sort[0][direction]': 'desc'
      });

      const url = `${API_BASE_URL}/Digests?${params.toString()}`;
      const response = await makeRequest(url);
      
      return response.records?.[0] || null;
    } catch (error) {
      handleApiError(error, 'načtení nejnovějšího digestu');
      return null;
    }
  },

  // Get digests by date range
  async getByDateRange(startDate: string, endDate: string): Promise<AirtableDigest[]> {
    try {
      const params = new URLSearchParams({
        filterByFormula: `AND(IS_AFTER({Date}, '${startDate}'), IS_BEFORE({Date}, '${endDate}'))`,
        'sort[0][field]': 'Date',
        'sort[0][direction]': 'desc'
      });

      const url = `${API_BASE_URL}/Digests?${params.toString()}`;
      const response = await makeRequest(url);
      
      return response.records || [];
    } catch (error) {
      handleApiError(error, 'načtení digestů podle data');
      return [];
    }
  },

  // Get all digests
  async getAll(limit: number = 30): Promise<AirtableDigest[]> {
    try {
      const params = new URLSearchParams({
        maxRecords: limit.toString(),
        'sort[0][field]': 'Date',
        'sort[0][direction]': 'desc'
      });

      const url = `${API_BASE_URL}/Digests?${params.toString()}`;
      const response = await makeRequest(url);
      
      return response.records || [];
    } catch (error) {
      handleApiError(error, 'načtení digestů');
      return [];
    }
  }
};

// Statistics API
export const statsApi = {
  // Get processing statistics
  async getStats(): Promise<{
    totalArticles: number;
    processedArticles: number;
    pendingArticles: number;
    errorArticles: number;
    totalSources: number;
    activeSources: number;
    totalDigests: number;
  }> {
    try {
      // Get articles stats
      const articlesResponse = await makeRequest(`${API_BASE_URL}/Articles`);
      const articles = articlesResponse.records || [];
      
      const processedArticles = articles.filter(a => a.fields.Status === 'Processed').length;
      const pendingArticles = articles.filter(a => a.fields.Status === 'New').length;
      const errorArticles = articles.filter(a => a.fields.Status === 'Error').length;
      
      // Get sources stats
      const sourcesResponse = await makeRequest(`${API_BASE_URL}/Sources`);
      const sources = sourcesResponse.records || [];
      const activeSources = sources.filter(s => s.fields.Active).length;
      
      // Get digests stats
      const digestsResponse = await makeRequest(`${API_BASE_URL}/Digests`);
      const digests = digestsResponse.records || [];
      
      const processingRate = articles.length > 0 ? (processedArticles / articles.length) * 100 : 0;
      
      return {
        totalArticles: articles.length,
        processedArticles,
        pendingArticles,
        errorArticles,
        totalSources: sources.length,
        activeSources,
        totalDigests: digests.length,
        processingRate
      };
    } catch (error) {
      handleApiError(error, 'načtení statistik');
      return {
        totalArticles: 0,
        processedArticles: 0,
        pendingArticles: 0,
        errorArticles: 0,
        totalSources: 0,
        activeSources: 0,
        totalDigests: 0,
        processingRate: 0
      };
    }
  }
};

// Export all APIs
export const airtableApi = {
  articles: articlesApi,
  sources: sourcesApi,
  digests: digestsApi,
  stats: statsApi
};

export default airtableApi;
