/**
 * EnsembleData API Service
 * Instagram and Facebook data scraping for Bengal political monitoring
 */

export interface SocialPost {
  id: string;
  platform: 'instagram' | 'facebook';
  username: string;
  displayName?: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares?: number;
  mediaUrl?: string;
  profilePicUrl?: string;
  hashtags: string[];
  url: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Bengal political keywords to track
const BENGAL_HASHTAGS = [
  'BJPBengal', 'BJP4Bengal', 'TMC', 'Trinamool',
  'MamataBanerjee', 'SuvenduAdhikari', 'WestBengalPolitics',
  'BengalNews', 'KolkataPolitics', 'BengalElection'
];

// Official accounts to monitor
const INSTAGRAM_ACCOUNTS = [
  'bjp4bengal',
  'bjp4india',
  'aborngfighter',  // Mamata Banerjee
  'suikiranshow',
  'bengalnews24'
];

const FACEBOOK_PAGES = [
  'BJPBengal',
  'BJP4India',
  'MamataBanerjeeOfficial',
  'AITCofficial'
];

class EnsembleDataService {
  private apiKey: string;
  private baseUrl = 'https://ensembledata.com/apis';
  private cache: Map<string, CacheEntry<any>> = new Map();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.apiKey = import.meta.env.VITE_ENSEMBLE_API_KEY || '';
  }

  private getCacheKey(endpoint: string, params: Record<string, any>): string {
    return `${endpoint}:${JSON.stringify(params)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < this.cacheDuration) {
      return entry.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Fetch Instagram posts by hashtag
   */
  async getInstagramHashtagPosts(hashtag: string, count: number = 20): Promise<SocialPost[]> {
    const cacheKey = this.getCacheKey('instagram/hashtag', { hashtag, count });
    const cached = this.getFromCache<SocialPost[]>(cacheKey);
    if (cached) return cached;

    try {
      if (!this.apiKey) {
        console.warn('[EnsembleData] No API key, using demo data');
        return this.getDemoInstagramPosts(hashtag);
      }

      const response = await fetch(`${this.baseUrl}/instagram/hashtag?name=${hashtag}&depth=1&cursor=null&token=${this.apiKey}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const posts = this.transformInstagramPosts(data.data || [], hashtag);
      this.setCache(cacheKey, posts);
      return posts;
    } catch (error) {
      console.error(`[EnsembleData] Instagram hashtag error for #${hashtag}:`, error);
      return this.getDemoInstagramPosts(hashtag);
    }
  }

  /**
   * Fetch Instagram user posts
   */
  async getInstagramUserPosts(username: string, count: number = 12): Promise<SocialPost[]> {
    const cacheKey = this.getCacheKey('instagram/user', { username, count });
    const cached = this.getFromCache<SocialPost[]>(cacheKey);
    if (cached) return cached;

    try {
      if (!this.apiKey) {
        console.warn('[EnsembleData] No API key, using demo data');
        return this.getDemoInstagramPosts(username);
      }

      const response = await fetch(`${this.baseUrl}/instagram/user/posts?username=${username}&depth=1&oldest_timestamp=0&cursor=null&token=${this.apiKey}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const posts = this.transformInstagramUserPosts(data.data || [], username);
      this.setCache(cacheKey, posts);
      return posts;
    } catch (error) {
      console.error(`[EnsembleData] Instagram user error for @${username}:`, error);
      return this.getDemoInstagramPosts(username);
    }
  }

  /**
   * Fetch Facebook page posts
   */
  async getFacebookPagePosts(pageName: string, count: number = 20): Promise<SocialPost[]> {
    const cacheKey = this.getCacheKey('facebook/page', { pageName, count });
    const cached = this.getFromCache<SocialPost[]>(cacheKey);
    if (cached) return cached;

    try {
      if (!this.apiKey) {
        console.warn('[EnsembleData] No API key, using demo data');
        return this.getDemoFacebookPosts(pageName);
      }

      const response = await fetch(`${this.baseUrl}/facebook/page/posts?url=https://facebook.com/${pageName}&depth=1&cursor=null&token=${this.apiKey}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const posts = this.transformFacebookPosts(data.data || [], pageName);
      this.setCache(cacheKey, posts);
      return posts;
    } catch (error) {
      console.error(`[EnsembleData] Facebook page error for ${pageName}:`, error);
      return this.getDemoFacebookPosts(pageName);
    }
  }

  /**
   * Get all Bengal political posts from multiple sources
   */
  async getAllBengalPoliticalPosts(): Promise<{
    instagram: SocialPost[];
    facebook: SocialPost[];
  }> {
    const instagramPosts: SocialPost[] = [];
    const facebookPosts: SocialPost[] = [];

    // Fetch from hashtags (parallel)
    const hashtagPromises = BENGAL_HASHTAGS.slice(0, 5).map(tag =>
      this.getInstagramHashtagPosts(tag, 10)
    );

    // Fetch from user accounts (parallel)
    const userPromises = INSTAGRAM_ACCOUNTS.slice(0, 3).map(user =>
      this.getInstagramUserPosts(user, 5)
    );

    // Fetch from Facebook pages (parallel)
    const fbPromises = FACEBOOK_PAGES.slice(0, 3).map(page =>
      this.getFacebookPagePosts(page, 10)
    );

    try {
      const [hashtagResults, userResults, fbResults] = await Promise.all([
        Promise.allSettled(hashtagPromises),
        Promise.allSettled(userPromises),
        Promise.allSettled(fbPromises)
      ]);

      // Collect Instagram hashtag posts
      hashtagResults.forEach(result => {
        if (result.status === 'fulfilled') {
          instagramPosts.push(...result.value);
        }
      });

      // Collect Instagram user posts
      userResults.forEach(result => {
        if (result.status === 'fulfilled') {
          instagramPosts.push(...result.value);
        }
      });

      // Collect Facebook posts
      fbResults.forEach(result => {
        if (result.status === 'fulfilled') {
          facebookPosts.push(...result.value);
        }
      });

      // Remove duplicates by ID
      const uniqueInstagram = this.removeDuplicates(instagramPosts);
      const uniqueFacebook = this.removeDuplicates(facebookPosts);

      return {
        instagram: uniqueInstagram,
        facebook: uniqueFacebook
      };
    } catch (error) {
      console.error('[EnsembleData] Error fetching all posts:', error);
      return {
        instagram: this.getDemoInstagramPosts('BJPBengal'),
        facebook: this.getDemoFacebookPosts('BJPBengal')
      };
    }
  }

  private transformInstagramPosts(posts: any[], hashtag: string): SocialPost[] {
    return posts.map((post: any, index: number) => ({
      id: post.id || `ig-${hashtag}-${index}-${Date.now()}`,
      platform: 'instagram' as const,
      username: post.owner?.username || post.user?.username || 'unknown',
      displayName: post.owner?.full_name || post.user?.full_name || '',
      content: post.caption?.text || post.edge_media_to_caption?.edges?.[0]?.node?.text || '',
      timestamp: post.taken_at_timestamp
        ? new Date(post.taken_at_timestamp * 1000).toISOString()
        : new Date().toISOString(),
      likes: post.like_count || post.edge_liked_by?.count || 0,
      comments: post.comment_count || post.edge_media_to_comment?.count || 0,
      mediaUrl: post.display_url || post.thumbnail_src || '',
      profilePicUrl: post.owner?.profile_pic_url || '',
      hashtags: this.extractHashtags(post.caption?.text || ''),
      url: `https://instagram.com/p/${post.shortcode || post.code || ''}`
    }));
  }

  private transformInstagramUserPosts(posts: any[], username: string): SocialPost[] {
    return posts.map((post: any, index: number) => ({
      id: post.id || `ig-user-${username}-${index}-${Date.now()}`,
      platform: 'instagram' as const,
      username: username,
      displayName: post.owner?.full_name || '',
      content: post.caption?.text || post.edge_media_to_caption?.edges?.[0]?.node?.text || '',
      timestamp: post.taken_at_timestamp
        ? new Date(post.taken_at_timestamp * 1000).toISOString()
        : new Date().toISOString(),
      likes: post.like_count || post.edge_liked_by?.count || 0,
      comments: post.comment_count || post.edge_media_to_comment?.count || 0,
      mediaUrl: post.display_url || post.thumbnail_src || '',
      profilePicUrl: post.owner?.profile_pic_url || '',
      hashtags: this.extractHashtags(post.caption?.text || ''),
      url: `https://instagram.com/p/${post.shortcode || post.code || ''}`
    }));
  }

  private transformFacebookPosts(posts: any[], pageName: string): SocialPost[] {
    return posts.map((post: any, index: number) => ({
      id: post.id || `fb-${pageName}-${index}-${Date.now()}`,
      platform: 'facebook' as const,
      username: pageName,
      displayName: post.page_name || pageName,
      content: post.text || post.message || '',
      timestamp: post.time ? new Date(post.time * 1000).toISOString() : new Date().toISOString(),
      likes: post.likes || post.reactions_count || 0,
      comments: post.comments || post.comments_count || 0,
      shares: post.shares || post.shares_count || 0,
      mediaUrl: post.image || post.full_picture || '',
      profilePicUrl: '',
      hashtags: this.extractHashtags(post.text || post.message || ''),
      url: post.post_url || `https://facebook.com/${pageName}`
    }));
  }

  private extractHashtags(text: string): string[] {
    const matches = text.match(/#[\w\u0980-\u09FF]+/g) || [];
    return matches.map(tag => tag.substring(1));
  }

  private removeDuplicates(posts: SocialPost[]): SocialPost[] {
    const seen = new Set<string>();
    return posts.filter(post => {
      if (seen.has(post.id)) return false;
      seen.add(post.id);
      return true;
    });
  }

  // Demo data for when API key is not available
  private getDemoInstagramPosts(source: string): SocialPost[] {
    const now = new Date();
    return [
      {
        id: `demo-ig-1-${source}`,
        platform: 'instagram',
        username: 'bjp4bengal',
        displayName: 'BJP Bengal',
        content: `West Bengal ke vikas ke liye BJP committed hai. Development, jobs, aur security - yahi hamara mission. #BJPBengal #BJP4Bengal #WestBengalPolitics`,
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        likes: 15420,
        comments: 892,
        mediaUrl: '',
        profilePicUrl: '',
        hashtags: ['BJPBengal', 'BJP4Bengal', 'WestBengalPolitics'],
        url: 'https://instagram.com/p/demo1'
      },
      {
        id: `demo-ig-2-${source}`,
        platform: 'instagram',
        username: 'bengalnews24',
        displayName: 'Bengal News 24',
        content: `Breaking: Political rally in Kolkata draws massive crowd. Both BJP and TMC supporters show strength. #KolkataPolitics #BengalNews`,
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        likes: 8930,
        comments: 456,
        mediaUrl: '',
        profilePicUrl: '',
        hashtags: ['KolkataPolitics', 'BengalNews'],
        url: 'https://instagram.com/p/demo2'
      },
      {
        id: `demo-ig-3-${source}`,
        platform: 'instagram',
        username: 'tmcofficial',
        displayName: 'TMC Official',
        content: `Mamata Banerjee ke netritva mein Bengal aage badh raha hai. Maa Mati Manush - yahi hamare core values hain. #TMC #Trinamool #MamataBanerjee`,
        timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        likes: 12500,
        comments: 678,
        mediaUrl: '',
        profilePicUrl: '',
        hashtags: ['TMC', 'Trinamool', 'MamataBanerjee'],
        url: 'https://instagram.com/p/demo3'
      }
    ];
  }

  private getDemoFacebookPosts(source: string): SocialPost[] {
    const now = new Date();
    return [
      {
        id: `demo-fb-1-${source}`,
        platform: 'facebook',
        username: 'BJPBengal',
        displayName: 'BJP Bengal Official',
        content: `PM Modi ke vision ke saath BJP Bengal mein naye karyakram launch kar raha hai. Youth employment aur women empowerment ke liye special schemes announce ki gayi.`,
        timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
        likes: 25600,
        comments: 1890,
        shares: 4500,
        mediaUrl: '',
        profilePicUrl: '',
        hashtags: ['BJPBengal', 'ModiInBengal'],
        url: 'https://facebook.com/BJPBengal/posts/demo1'
      },
      {
        id: `demo-fb-2-${source}`,
        platform: 'facebook',
        username: 'AITCofficial',
        displayName: 'All India Trinamool Congress',
        content: `Bengal ke development mein TMC sarkar ka significant contribution. Healthcare, education aur infrastructure - sab sectors mein improvement dikhai de raha hai.`,
        timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
        likes: 18900,
        comments: 1234,
        shares: 3200,
        mediaUrl: '',
        profilePicUrl: '',
        hashtags: ['TMC', 'BengalDevelopment'],
        url: 'https://facebook.com/AITCofficial/posts/demo2'
      }
    ];
  }

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const ensembleDataService = new EnsembleDataService();
export default ensembleDataService;
