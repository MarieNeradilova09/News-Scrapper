// Web scraper utility pro testování
export interface ScrapedArticle {
  title: string;
  content: string;
  url: string;
  publishedAt: string;
  source: string;
}

export interface ScrapingSource {
  id: string;
  name: string;
  url: string;
  selector: string;
  category: string;
}

// Testovací zdroje
export const TEST_SOURCES: ScrapingSource[] = [
  {
    id: "techcrunch",
    name: "TechCrunch",
    url: "https://techcrunch.com",
    selector: ".post-block__content",
    category: "Tech"
  },
  {
    id: "hackernews",
    name: "Hacker News",
    url: "https://news.ycombinator.com",
    selector: ".titleline > a",
    category: "Tech"
  },
  {
    id: "bbc",
    name: "BBC News",
    url: "https://www.bbc.com/news",
    selector: ".gs-c-promo-heading",
    category: "News"
  }
];

// Simulace scrapingu (pro testování bez CORS problémů)
export const simulateScraping = async (source: ScrapingSource): Promise<ScrapedArticle[]> => {
  // Simulace delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data pro testování
  const mockArticles: ScrapedArticle[] = [
    {
      title: `Test článek z ${source.name} - AI revoluce`,
      content: `Toto je testovací obsah článku o AI revoluci z ${source.name}. Obsahuje informace o nejnovějších trendech v umělé inteligenci a jejím dopadu na společnost.`,
      url: `${source.url}/test-article-1`,
      publishedAt: new Date().toISOString(),
      source: source.name
    },
    {
      title: `Test článek z ${source.name} - Technologie`,
      content: `Další testovací článek o technologiích z ${source.name}. Popisuje nejnovější inovace a jejich praktické využití.`,
      url: `${source.url}/test-article-2`,
      publishedAt: new Date(Date.now() - 86400000).toISOString(), // Včera
      source: source.name
    }
  ];
  
  return mockArticles;
};

// Funkce pro filtrování článků podle data
export const filterArticlesByDate = (articles: ScrapedArticle[], daysBack: number = 1): ScrapedArticle[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  
  return articles.filter(article => {
    const articleDate = new Date(article.publishedAt);
    return articleDate >= cutoffDate;
  });
};

// Funkce pro detekci duplicit
export const detectDuplicates = (articles: ScrapedArticle[]): ScrapedArticle[] => {
  const seen = new Set<string>();
  return articles.filter(article => {
    const key = article.title.toLowerCase().trim();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

// Hlavní funkce pro scraping
export const scrapeSources = async (sources: ScrapingSource[]): Promise<ScrapedArticle[]> => {
  const allArticles: ScrapedArticle[] = [];
  
  for (const source of sources) {
    try {
      console.log(`Scraping ${source.name}...`);
      const articles = await simulateScraping(source);
      allArticles.push(...articles);
    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error);
    }
  }
  
  // Filtrování a deduplikace
  const filteredArticles = filterArticlesByDate(allArticles);
  const uniqueArticles = detectDuplicates(filteredArticles);
  
  return uniqueArticles;
};
