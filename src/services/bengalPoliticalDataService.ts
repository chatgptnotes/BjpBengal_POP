/**
 * Bengal Political Data Service
 * Unified aggregator for all social media and news data
 * REAL-TIME DATA from Twitter, News, and AI Analysis via CometAPI/OpenAI
 */

import { ensembleDataService, SocialPost } from './ensembleDataService';
import { cometApiService, ContentAnalysis } from './cometApiService';
import { fetchBJPBengalFeed, Tweet } from './twitterScraper';

export interface AnalyzedPost extends SocialPost {
  analysis?: ContentAnalysis;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content?: string;
  source: string;
  author?: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  analysis?: ContentAnalysis;
}

export interface TwitterPost {
  id: string;
  platform: 'twitter';
  username: string;
  displayName: string;
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  replies: number;
  profilePicUrl?: string;
  hashtags: string[];
  url: string;
  analysis?: ContentAnalysis;
}

export interface SentimentStats {
  positive: number;
  negative: number;
  neutral: number;
}

export interface BengalPoliticalData {
  instagram: AnalyzedPost[];
  facebook: AnalyzedPost[];
  twitter: TwitterPost[];
  news: NewsArticle[];
  analytics: {
    totalPosts: number;
    bjpMentions: number;
    tmcMentions: number;
    sentimentBreakdown: SentimentStats;
    topHashtags: { tag: string; count: number }[];
    trendingTopics: string[];
    platformBreakdown: {
      instagram: number;
      facebook: number;
      twitter: number;
      news: number;
    };
  };
  lastUpdated: string;
}

class BengalPoliticalDataService {
  private cache: BengalPoliticalData | null = null;
  private cacheTimestamp: number = 0;
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  /**
   * Get all Bengal political data from all sources
   */
  async getAllData(forceRefresh: boolean = false): Promise<BengalPoliticalData> {
    // Return cached data if valid
    if (!forceRefresh && this.cache && Date.now() - this.cacheTimestamp < this.cacheDuration) {
      return this.cache;
    }

    try {
      // Fetch data from all sources in parallel
      const [socialData, twitterData, newsData] = await Promise.all([
        this.fetchSocialMediaData(),
        this.fetchTwitterData(),
        this.fetchNewsData()
      ]);

      // Analyze content with AI
      const [analyzedInstagram, analyzedFacebook, analyzedTwitter, analyzedNews] = await Promise.all([
        this.analyzePostsBatch(socialData.instagram),
        this.analyzePostsBatch(socialData.facebook),
        this.analyzeTwitterBatch(twitterData),
        this.analyzeNewsBatch(newsData)
      ]);

      // Calculate analytics
      const analytics = this.calculateAnalytics(
        analyzedInstagram,
        analyzedFacebook,
        analyzedTwitter,
        analyzedNews
      );

      const data: BengalPoliticalData = {
        instagram: analyzedInstagram,
        facebook: analyzedFacebook,
        twitter: analyzedTwitter,
        news: analyzedNews,
        analytics,
        lastUpdated: new Date().toISOString()
      };

      // Cache the data
      this.cache = data;
      this.cacheTimestamp = Date.now();

      return data;
    } catch (error) {
      console.error('[BengalPoliticalData] Error fetching data:', error);

      // Return demo data on error
      return this.getDemoData();
    }
  }

  /**
   * Fetch social media data from EnsembleData
   */
  private async fetchSocialMediaData(): Promise<{ instagram: SocialPost[]; facebook: SocialPost[] }> {
    try {
      return await ensembleDataService.getAllBengalPoliticalPosts();
    } catch (error) {
      console.error('[BengalPoliticalData] Social media fetch error:', error);
      return { instagram: [], facebook: [] };
    }
  }

  /**
   * Fetch REAL Twitter data using Twitter Scraper
   */
  private async fetchTwitterData(): Promise<TwitterPost[]> {
    try {
      console.log('[BengalPoliticalData] Fetching REAL Twitter data...');
      const twitterFeed = await fetchBJPBengalFeed(50);

      if (!twitterFeed.data || twitterFeed.data.length === 0) {
        console.warn('[BengalPoliticalData] No Twitter data returned, using fallback');
        return this.getFallbackTwitterData();
      }

      console.log(`[BengalPoliticalData] Got ${twitterFeed.data.length} REAL tweets`);

      // Convert Tweet format to TwitterPost format
      return twitterFeed.data.map((tweet: Tweet) => ({
        id: tweet.id,
        platform: 'twitter' as const,
        username: tweet.author?.username || 'unknown',
        displayName: tweet.author?.name || 'Unknown User',
        content: tweet.text,
        timestamp: tweet.created_at,
        likes: tweet.public_metrics?.like_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        replies: tweet.public_metrics?.reply_count || 0,
        profilePicUrl: tweet.author?.profile_image_url,
        hashtags: tweet.entities?.hashtags?.map(h => h.tag) || [],
        url: `https://twitter.com/${tweet.author?.username || 'i'}/status/${tweet.id}`
      }));
    } catch (error) {
      console.error('[BengalPoliticalData] Twitter fetch error:', error);
      return this.getFallbackTwitterData();
    }
  }

  /**
   * Fallback Twitter data when API fails
   */
  private getFallbackTwitterData(): TwitterPost[] {
    const now = new Date();
    return [
      {
        id: 'fallback-tw-1',
        platform: 'twitter',
        username: 'BJP4Bengal',
        displayName: 'BJP Bengal',
        content: 'West Bengal ke vikas ke liye BJP committed hai. PM Modi ke netritva mein Bengal mein naya savera ayega. #BJPBengal #ModiHaiToMumkinHai',
        timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        likes: 12500,
        retweets: 3400,
        replies: 890,
        hashtags: ['BJPBengal', 'ModiHaiToMumkinHai'],
        url: 'https://twitter.com/BJP4Bengal/status/fallback1'
      }
    ];
  }

  // Political keywords for filtering
  private politicalKeywords = [
    'bjp', 'tmc', 'trinamool', 'mamata', 'banerjee', 'modi', 'suvendu', 'adhikari',
    'dilip ghosh', 'abhishek', 'election', 'vote', 'poll', 'bengal politic',
    'west bengal', 'kolkata', 'assembly', 'lok sabha', 'mla', 'mp', 'minister',
    'congress', 'cpim', 'left', 'rally', 'campaign'
  ];

  /**
   * Check if content contains political keywords
   */
  private isPoliticalContent(text: string): boolean {
    const lowerText = text.toLowerCase();
    return this.politicalKeywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Fetch news data - ONLY BJP/TMC Political News
   */
  private async fetchNewsData(): Promise<NewsArticle[]> {
    const newsApiKey = import.meta.env.VITE_NEWSAPI_KEY;

    if (!newsApiKey) {
      console.log('[BengalPoliticalData] No NewsAPI key, using demo data');
      return this.getDemoNews();
    }

    try {
      // More specific political query for BJP/TMC
      const politicalQuery = encodeURIComponent(
        '("BJP" AND "Bengal") OR ("TMC" AND "Bengal") OR "Mamata Banerjee" OR "Suvendu Adhikari" OR ("West Bengal" AND "election") OR "Trinamool Congress" OR ("Bengal" AND "politics")'
      );

      console.log('[BengalPoliticalData] Fetching POLITICAL news from NewsAPI...');

      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${politicalQuery}&language=en&sortBy=publishedAt&pageSize=30&apiKey=${newsApiKey}`
      );

      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[BengalPoliticalData] NewsAPI returned ${data.articles?.length || 0} articles`);

      // Map and filter for political content
      const articles = (data.articles || [])
        .map((article: any, index: number) => ({
          id: `news-${index}-${Date.now()}`,
          title: article.title || '',
          description: article.description || '',
          content: article.content || '',
          source: article.source?.name || 'Unknown',
          author: article.author || '',
          url: article.url || '',
          imageUrl: article.urlToImage || '',
          publishedAt: article.publishedAt || new Date().toISOString()
        }))
        .filter((article: NewsArticle) =>
          this.isPoliticalContent(article.title) ||
          this.isPoliticalContent(article.description || '')
        );

      console.log(`[BengalPoliticalData] Filtered to ${articles.length} POLITICAL articles`);
      return articles;
    } catch (error) {
      console.error('[BengalPoliticalData] News fetch error:', error);
      return this.getDemoNews();
    }
  }

  /**
   * Analyze social posts with AI
   */
  private async analyzePostsBatch(posts: SocialPost[]): Promise<AnalyzedPost[]> {
    const analyzed: AnalyzedPost[] = [];

    for (const post of posts.slice(0, 20)) {
      try {
        const analysis = await cometApiService.analyzeContent(post.content);
        analyzed.push({ ...post, analysis });
      } catch (error) {
        analyzed.push({ ...post });
      }
    }

    return analyzed;
  }

  /**
   * Analyze Twitter posts
   */
  private async analyzeTwitterBatch(posts: TwitterPost[]): Promise<TwitterPost[]> {
    const analyzed: TwitterPost[] = [];

    for (const post of posts) {
      try {
        const analysis = await cometApiService.analyzeContent(post.content);
        analyzed.push({ ...post, analysis });
      } catch (error) {
        analyzed.push({ ...post });
      }
    }

    return analyzed;
  }

  /**
   * Analyze news articles
   */
  private async analyzeNewsBatch(articles: NewsArticle[]): Promise<NewsArticle[]> {
    const analyzed: NewsArticle[] = [];

    for (const article of articles.slice(0, 10)) {
      try {
        const content = `${article.title}. ${article.description || ''}`;
        const analysis = await cometApiService.analyzeContent(content);
        analyzed.push({ ...article, analysis });
      } catch (error) {
        analyzed.push({ ...article });
      }
    }

    return analyzed;
  }

  /**
   * Calculate analytics from all data
   */
  private calculateAnalytics(
    instagram: AnalyzedPost[],
    facebook: AnalyzedPost[],
    twitter: TwitterPost[],
    news: NewsArticle[]
  ) {
    const allPosts = [...instagram, ...facebook, ...twitter, ...news];

    // Sentiment counts
    const sentimentBreakdown: SentimentStats = { positive: 0, negative: 0, neutral: 0 };

    // Political mentions
    let bjpMentions = 0;
    let tmcMentions = 0;

    // Hashtag counts
    const hashtagCounts: Record<string, number> = {};

    // Topic counts
    const topicCounts: Record<string, number> = {};

    allPosts.forEach((post: any) => {
      // Count sentiments
      const sentiment = post.analysis?.sentiment?.sentiment || 'neutral';
      sentimentBreakdown[sentiment]++;

      // Count political mentions
      if (post.analysis?.politicalStance?.bjpMention) bjpMentions++;
      if (post.analysis?.politicalStance?.tmcMention) tmcMentions++;

      // Count hashtags
      const hashtags = post.hashtags || [];
      hashtags.forEach((tag: string) => {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
      });

      // Count topics
      const topics = post.analysis?.topics?.topics || [];
      topics.forEach((topic: string) => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    });

    // Sort hashtags by count
    const topHashtags = Object.entries(hashtagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get trending topics
    const trendingTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);

    return {
      totalPosts: allPosts.length,
      bjpMentions,
      tmcMentions,
      sentimentBreakdown,
      topHashtags,
      trendingTopics,
      platformBreakdown: {
        instagram: instagram.length,
        facebook: facebook.length,
        twitter: twitter.length,
        news: news.length
      }
    };
  }

  /**
   * Get demo news articles
   */
  private getDemoNews(): NewsArticle[] {
    const now = new Date();
    return [
      {
        id: 'news-demo-1',
        title: 'BJP Bengal announces major campaign for upcoming elections',
        description: 'The Bharatiya Janata Party in West Bengal has announced a comprehensive campaign strategy targeting rural and urban voters.',
        source: 'Bengal Times',
        url: 'https://example.com/news/1',
        publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'news-demo-2',
        title: 'TMC government launches new welfare schemes',
        description: 'Chief Minister Mamata Banerjee unveiled new welfare initiatives focusing on women empowerment and youth employment in West Bengal.',
        source: 'Kolkata Daily',
        url: 'https://example.com/news/2',
        publishedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'news-demo-3',
        title: 'Political temperature rises in West Bengal ahead of polls',
        description: 'Both BJP and TMC are intensifying their grassroots campaigns as the state prepares for crucial elections.',
        source: 'India Today',
        url: 'https://example.com/news/3',
        publishedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  /**
   * Get demo data for fallback
   */
  private getDemoData(): BengalPoliticalData {
    const now = new Date();

    return {
      instagram: [
        {
          id: 'demo-ig-1',
          platform: 'instagram',
          username: 'bjp4bengal',
          displayName: 'BJP Bengal',
          content: 'West Bengal ke vikas ke liye BJP committed hai. #BJPBengal #BJP4Bengal',
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          likes: 15420,
          comments: 892,
          hashtags: ['BJPBengal', 'BJP4Bengal'],
          url: 'https://instagram.com/p/demo1',
          analysis: {
            sentiment: { sentiment: 'positive', confidence: 0.8 },
            politicalStance: { stance: 'pro-bjp', confidence: 0.9, bjpMention: true, tmcMention: false, keywords: ['bjp', 'vikas'] },
            topics: { topics: ['Development'], entities: { people: [], places: ['West Bengal'], organizations: ['BJP'] }, summary: 'BJP commitment to Bengal development' }
          }
        }
      ],
      facebook: [
        {
          id: 'demo-fb-1',
          platform: 'facebook',
          username: 'AITCofficial',
          displayName: 'TMC Official',
          content: 'Mamata Banerjee ke netritva mein Bengal aage badh raha hai. #TMC #MamataBanerjee',
          timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
          likes: 18900,
          comments: 1234,
          shares: 3200,
          hashtags: ['TMC', 'MamataBanerjee'],
          url: 'https://facebook.com/AITCofficial/demo1',
          analysis: {
            sentiment: { sentiment: 'positive', confidence: 0.75 },
            politicalStance: { stance: 'pro-tmc', confidence: 0.9, bjpMention: false, tmcMention: true, keywords: ['mamata', 'tmc'] },
            topics: { topics: ['Leadership'], entities: { people: ['Mamata Banerjee'], places: ['Bengal'], organizations: ['TMC'] }, summary: 'TMC leadership in Bengal' }
          }
        }
      ],
      twitter: [
        {
          id: 'demo-tw-1',
          platform: 'twitter',
          username: 'BJP4Bengal',
          displayName: 'BJP Bengal',
          content: 'PM Modi ke netritva mein Bengal mein naya savera ayega. #BJPBengal',
          timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
          likes: 12500,
          retweets: 3400,
          replies: 890,
          hashtags: ['BJPBengal'],
          url: 'https://twitter.com/BJP4Bengal/demo1',
          analysis: {
            sentiment: { sentiment: 'positive', confidence: 0.85 },
            politicalStance: { stance: 'pro-bjp', confidence: 0.95, bjpMention: true, tmcMention: false, keywords: ['modi', 'bjp'] },
            topics: { topics: ['Leadership'], entities: { people: ['Modi'], places: ['Bengal'], organizations: ['BJP'] }, summary: 'BJP vision for Bengal' }
          }
        }
      ],
      news: this.getDemoNews().map(article => ({
        ...article,
        analysis: {
          sentiment: { sentiment: 'neutral' as const, confidence: 0.7 },
          politicalStance: { stance: 'neutral' as const, confidence: 0.6, bjpMention: true, tmcMention: true, keywords: [] },
          topics: { topics: ['Elections', 'Politics'], entities: { people: [], places: ['West Bengal'], organizations: [] }, summary: article.title }
        }
      })),
      analytics: {
        totalPosts: 7,
        bjpMentions: 3,
        tmcMentions: 2,
        sentimentBreakdown: { positive: 4, negative: 1, neutral: 2 },
        topHashtags: [
          { tag: 'BJPBengal', count: 3 },
          { tag: 'TMC', count: 2 },
          { tag: 'WestBengalPolitics', count: 2 }
        ],
        trendingTopics: ['Elections', 'Development', 'Leadership'],
        platformBreakdown: {
          instagram: 1,
          facebook: 1,
          twitter: 1,
          news: 3
        }
      },
      lastUpdated: now.toISOString()
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }
}

export const bengalPoliticalDataService = new BengalPoliticalDataService();
export default bengalPoliticalDataService;
