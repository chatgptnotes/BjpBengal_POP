/**
 * NewsAPI Service
 * Fetches live news from NewsAPI.org focused on India Political News
 */

export interface NewsApiArticle {
  id: string;
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
  // Custom fields added after fetching
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentimentScore?: number;
  bjpMentioned?: boolean;
  category?: string;
}

export interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsApiArticle[];
}

export interface NewsApiSource {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  language: string;
  country: string;
}

// Bengal-specific keywords for local news
const BENGAL_KEYWORDS = [
  'West Bengal', 'Kolkata', 'Bengal', 'Mamata Banerjee', 'TMC',
  'Trinamool', 'BJP Bengal', 'Bengal politics', 'Howrah', 'Siliguri',
  'Darjeeling', 'Malda', 'Murshidabad', 'Hooghly', 'Burdwan',
  'Sukanta Majumdar', 'Suvendu Adhikari', 'Abhishek Banerjee'
];

// Political keywords for India
const POLITICAL_KEYWORDS = [
  'BJP', 'Congress', 'Modi', 'Rahul Gandhi', 'Mamata Banerjee',
  'Parliament', 'Lok Sabha', 'Rajya Sabha', 'Election', 'Politics',
  'Government', 'Minister', 'Prime Minister', 'Chief Minister',
  'NDA', 'INDIA Alliance', 'AAP', 'TMC', 'West Bengal'
];

// BJP-specific keywords for detection
const BJP_KEYWORDS = [
  'BJP', 'Bharatiya Janata Party', 'Modi', 'Narendra Modi', 'PM Modi',
  'Amit Shah', 'JP Nadda', 'NDA', 'Saffron', 'Lotus',
  'Sukanta Majumdar', 'Dilip Ghosh', 'Suvendu Adhikari'
];

// Cache for API responses
interface CacheEntry {
  data: NewsApiResponse;
  timestamp: number;
}

const cache: Map<string, CacheEntry> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class NewsApiService {
  private apiKey: string;
  private baseUrl: string = 'https://newsapi.org/v2';
  private proxyUrl: string = 'http://localhost:3001';

  constructor() {
    this.apiKey = import.meta.env.VITE_NEWSAPI_KEY || '';
  }

  /**
   * Get cached response or null if expired/missing
   */
  private getCached(key: string): NewsApiResponse | null {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
      return entry.data;
    }
    cache.delete(key);
    return null;
  }

  /**
   * Set cache entry
   */
  private setCache(key: string, data: NewsApiResponse): void {
    cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Generate unique ID for articles
   */
  private generateId(article: NewsApiArticle): string {
    return btoa(article.url).slice(0, 20) + '_' + Date.now().toString(36);
  }

  /**
   * Detect BJP mentions in text
   */
  detectBJPMention(text: string): boolean {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return BJP_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
  }

  /**
   * Simple sentiment analysis based on keywords
   */
  analyzeSentiment(text: string): { sentiment: 'positive' | 'negative' | 'neutral'; score: number } {
    if (!text) return { sentiment: 'neutral', score: 0.5 };

    const positiveWords = [
      'success', 'win', 'victory', 'growth', 'development', 'progress',
      'achievement', 'support', 'benefit', 'improve', 'positive', 'good',
      'great', 'excellent', 'boost', 'rise', 'gain', 'profit', 'approve'
    ];
    const negativeWords = [
      'fail', 'loss', 'defeat', 'crisis', 'scandal', 'controversy',
      'problem', 'issue', 'concern', 'decline', 'negative', 'bad',
      'worst', 'poor', 'drop', 'fall', 'protest', 'oppose', 'reject'
    ];

    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveCount++;
    });
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeCount++;
    });

    const total = positiveCount + negativeCount;
    if (total === 0) return { sentiment: 'neutral', score: 0.5 };

    const score = positiveCount / total;
    if (score > 0.6) return { sentiment: 'positive', score };
    if (score < 0.4) return { sentiment: 'negative', score };
    return { sentiment: 'neutral', score: 0.5 };
  }

  /**
   * Process articles - add IDs, sentiment, BJP detection
   */
  private processArticles(articles: NewsApiArticle[]): NewsApiArticle[] {
    return articles.map(article => {
      const fullText = `${article.title || ''} ${article.description || ''} ${article.content || ''}`;
      const sentimentResult = this.analyzeSentiment(fullText);

      return {
        ...article,
        id: this.generateId(article),
        bjpMentioned: this.detectBJPMention(fullText),
        sentiment: sentimentResult.sentiment,
        sentimentScore: sentimentResult.score
      };
    });
  }

  /**
   * Fetch top headlines for India
   */
  async getTopHeadlines(category?: string, pageSize: number = 50): Promise<NewsApiResponse> {
    const cacheKey = `headlines_${category || 'general'}_${pageSize}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        country: 'in',
        pageSize: pageSize.toString(),
        apiKey: this.apiKey
      });

      if (category) {
        params.append('category', category);
      }

      const response = await fetch(`${this.baseUrl}/top-headlines?${params}`);
      const data: NewsApiResponse = await response.json();

      if (data.status === 'ok') {
        data.articles = this.processArticles(data.articles);
        this.setCache(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error('Error fetching top headlines:', error);
      return { status: 'error', totalResults: 0, articles: [] };
    }
  }

  /**
   * Fetch Bengal local news using everything endpoint
   */
  async getPoliticalNews(pageSize: number = 50): Promise<NewsApiResponse> {
    // Default to Bengal news
    return this.getBengalNews(pageSize);
  }

  /**
   * Fetch West Bengal local news from Google News RSS Proxy
   */
  async getBengalNews(pageSize: number = 50): Promise<NewsApiResponse> {
    const cacheKey = `bengal_${pageSize}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Use Google News RSS proxy for local Bengal news
      const response = await fetch(`${this.proxyUrl}/api/rss-proxy?keyword=West Bengal politics`);
      const data = await response.json();

      if (data.success && data.articles) {
        // Transform proxy response to match NewsApiArticle format
        const articles: NewsApiArticle[] = data.articles.map((article: {
          id: string;
          title: string;
          description: string;
          url: string;
          source: string;
          published_at: string;
          image_url: string | null;
        }) => ({
          id: article.id || this.generateId({ url: article.url } as NewsApiArticle),
          source: { id: null, name: article.source || 'Google News' },
          author: null,
          title: article.title,
          description: article.description,
          url: article.url,
          urlToImage: article.image_url,
          publishedAt: article.published_at,
          content: article.description
        }));

        const processedArticles = this.processArticles(articles);
        const result: NewsApiResponse = {
          status: 'ok',
          totalResults: processedArticles.length,
          articles: processedArticles
        };
        this.setCache(cacheKey, result);
        return result;
      }

      return { status: 'error', totalResults: 0, articles: [] };
    } catch (error) {
      console.error('Error fetching Bengal news from proxy:', error);
      return { status: 'error', totalResults: 0, articles: [] };
    }
  }

  /**
   * Fetch national political news
   */
  async getNationalNews(pageSize: number = 50): Promise<NewsApiResponse> {
    const cacheKey = `national_${pageSize}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const query = POLITICAL_KEYWORDS.slice(0, 5).join(' OR ');
      const params = new URLSearchParams({
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: pageSize.toString(),
        apiKey: this.apiKey
      });

      const response = await fetch(`${this.baseUrl}/everything?${params}`);
      const data: NewsApiResponse = await response.json();

      if (data.status === 'ok') {
        data.articles = this.processArticles(data.articles);
        this.setCache(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error('Error fetching national news:', error);
      return { status: 'error', totalResults: 0, articles: [] };
    }
  }

  /**
   * Search news by custom query using Google News RSS Proxy
   */
  async searchNews(query: string, pageSize: number = 50): Promise<NewsApiResponse> {
    const cacheKey = `search_${query}_${pageSize}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Use proxy for search
      const searchQuery = encodeURIComponent(`${query} West Bengal`);
      const response = await fetch(`${this.proxyUrl}/api/rss-proxy?keyword=${searchQuery}`);
      const data = await response.json();

      if (data.success && data.articles) {
        const articles: NewsApiArticle[] = data.articles.map((article: {
          id: string;
          title: string;
          description: string;
          url: string;
          source: string;
          published_at: string;
          image_url: string | null;
        }) => ({
          id: article.id || this.generateId({ url: article.url } as NewsApiArticle),
          source: { id: null, name: article.source || 'Google News' },
          author: null,
          title: article.title,
          description: article.description,
          url: article.url,
          urlToImage: article.image_url,
          publishedAt: article.published_at,
          content: article.description
        }));

        const processedArticles = this.processArticles(articles);
        const result: NewsApiResponse = {
          status: 'ok',
          totalResults: processedArticles.length,
          articles: processedArticles
        };
        this.setCache(cacheKey, result);
        return result;
      }

      return { status: 'error', totalResults: 0, articles: [] };
    } catch (error) {
      console.error('Error searching news:', error);
      return { status: 'error', totalResults: 0, articles: [] };
    }
  }

  /**
   * Get news sources for India
   */
  async getSources(): Promise<NewsApiSource[]> {
    const cacheKey = 'sources';
    const cached = this.getCached(cacheKey);
    if (cached) return cached.articles as unknown as NewsApiSource[];

    try {
      const params = new URLSearchParams({
        country: 'in',
        language: 'en',
        apiKey: this.apiKey
      });

      const response = await fetch(`${this.baseUrl}/top-headlines/sources?${params}`);
      const data = await response.json();

      if (data.status === 'ok') {
        this.setCache(cacheKey, { status: 'ok', totalResults: data.sources.length, articles: data.sources });
        return data.sources;
      }

      return [];
    } catch (error) {
      console.error('Error fetching sources:', error);
      return [];
    }
  }

  /**
   * Get BJP-specific news
   */
  async getBJPNews(pageSize: number = 50): Promise<NewsApiResponse> {
    const cacheKey = `bjp_${pageSize}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const query = 'BJP OR "Narendra Modi" OR "Bharatiya Janata Party"';
      const params = new URLSearchParams({
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: pageSize.toString(),
        apiKey: this.apiKey
      });

      const response = await fetch(`${this.baseUrl}/everything?${params}`);
      const data: NewsApiResponse = await response.json();

      if (data.status === 'ok') {
        data.articles = this.processArticles(data.articles);
        this.setCache(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error('Error fetching BJP news:', error);
      return { status: 'error', totalResults: 0, articles: [] };
    }
  }

  /**
   * Get constituency-specific news from proxy
   */
  async getConstituencyNews(constituencyId: string): Promise<NewsApiResponse> {
    const cacheKey = `constituency_${constituencyId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.proxyUrl}/api/news/constituency/${constituencyId}`);
      const data = await response.json();

      if (data.success && data.articles) {
        const articles: NewsApiArticle[] = data.articles.map((article: {
          id: string;
          title: string;
          description: string;
          url: string;
          source: string;
          published_at: string;
          sentiment?: string;
        }) => ({
          id: article.id,
          source: { id: null, name: article.source || 'Google News' },
          author: null,
          title: article.title,
          description: article.description,
          url: article.url,
          urlToImage: null,
          publishedAt: article.published_at,
          content: article.description
        }));

        const processedArticles = this.processArticles(articles);
        const result: NewsApiResponse = {
          status: 'ok',
          totalResults: processedArticles.length,
          articles: processedArticles
        };
        this.setCache(cacheKey, result);
        return result;
      }

      return { status: 'error', totalResults: 0, articles: [] };
    } catch (error) {
      console.error('Error fetching constituency news:', error);
      return { status: 'error', totalResults: 0, articles: [] };
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    cache.clear();
  }
}

export const newsApiService = new NewsApiService();
export default newsApiService;
