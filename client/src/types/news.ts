export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  preferences?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Source {
  id: string;
  name: string;
  url: string;
  rssUrl?: string;
  isActive: boolean;
  fetchInterval: number;
  lastFetchAt?: string;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  url: string;
  content?: string;
  snippet?: string;
  sourceId?: string;
  publishedAt?: string;
  fetchedAt: string;
  category: 'ai_ml' | 'startups' | 'cybersecurity' | 'mobile' | 'web3' | 'others';
  thumbnail?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentimentScore?: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleWithSource extends Article {
  source?: Source | null;
  isBookmarked?: boolean;
  relatedArticles?: ArticleWithSource[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface TrendingTopic {
  id: string;
  date: string;
  topic: string;
  count: number;
  category?: string;
  growthRate?: number;
  createdAt: string;
}

export interface SearchFilters {
  category?: string;
  timeRange?: 'today' | 'week' | 'month';
  search?: string;
  page?: number;
  limit?: number;
}

export interface CategoryCount {
  [key: string]: number;
}

export const CATEGORIES = {
  all: 'All News',
  ai_ml: 'AI/ML',
  startups: 'Startups',
  cybersecurity: 'Cybersecurity',
  mobile: 'Mobile',
  web3: 'Web3',
  others: 'Others',
} as const;

export const TIME_RANGES = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
} as const;

export const SENTIMENT_COLORS = {
  positive: 'text-green-600',
  negative: 'text-red-600',
  neutral: 'text-gray-600',
} as const;

export const SENTIMENT_ICONS = {
  positive: 'fas fa-arrow-up',
  negative: 'fas fa-arrow-down',
  neutral: 'fas fa-minus',
} as const;

export const CATEGORY_COLORS = {
  ai_ml: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200',
  startups: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
  cybersecurity: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  mobile: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  web3: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
  others: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200',
} as const;
