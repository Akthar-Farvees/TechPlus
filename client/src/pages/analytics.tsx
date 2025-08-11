import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWebSocket } from "@/hooks/useWebSocket";
import { formatDistanceToNow } from "date-fns";

interface TrendingTopic {
  topic: string;
  count: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  category: string;
  lastMentioned: string;
  growth: number;
}

interface AnalyticsData {
  totalArticles: number;
  articlesThisWeek: number;
  trendingTopics: TrendingTopic[];
  categoryStats: Record<string, number>;
  sourceStats: Record<string, number>;
  sentimentStats: Record<string, number>;
  viewStats: {
    totalViews: number;
    topArticles: Array<{
      title: string;
      views: number;
      source: string;
      publishedAt: string;
    }>;
  };
}

export default function Analytics() {
  const { isConnected } = useWebSocket();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/analytics', { timeRange }],
    retry: 1,
  }) as { data: AnalyticsData | undefined, isLoading: boolean };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'ai_ml': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'startups': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'cybersecurity': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'mobile': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'web3': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'others': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    };
    return colors[category] || colors.others;
  };

  const getSentimentColor = (sentiment: string) => {
    const colors: Record<string, string> = {
      'positive': 'text-green-600 dark:text-green-400',
      'negative': 'text-red-600 dark:text-red-400',
      'neutral': 'text-gray-600 dark:text-gray-400',
    };
    return colors[sentiment] || colors.neutral;
  };

  const getSentimentIcon = (sentiment: string) => {
    const icons: Record<string, string> = {
      'positive': 'fas fa-smile',
      'negative': 'fas fa-frown',
      'neutral': 'fas fa-meh',
    };
    return icons[sentiment] || icons.neutral;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onSearch={() => {}} isConnected={isConnected} />
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-96 animate-pulse"></div>
            </div>
            
            {/* Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card border rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </div>
              ))}
            </div>
            
            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-4 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
              <div className="bg-card border rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-4 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={() => {}} isConnected={isConnected} />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center">
                <i className="fas fa-chart-line text-primary mr-3"></i>
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Trending topics, insights, and news analytics
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {(['today', 'week', 'month'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className="text-xs"
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <i className="fas fa-newspaper text-muted-foreground"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalArticles || 0}</div>
              <p className="text-xs text-muted-foreground">
                {analytics?.articlesThisWeek || 0} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <i className="fas fa-eye text-muted-foreground"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.viewStats?.totalViews || 0}</div>
              <p className="text-xs text-muted-foreground">
                Across all articles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trending Topics</CardTitle>
              <i className="fas fa-fire text-muted-foreground"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.trendingTopics?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Hot discussions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <i className="fas fa-tags text-muted-foreground"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(analytics?.categoryStats || {}).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Active categories
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trending">Trending Topics</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trending Topics</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.trendingTopics && analytics.trendingTopics.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.trendingTopics.slice(0, 10).map((topic, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-foreground">#{topic.topic}</span>
                            <Badge className={getCategoryColor(topic.category)}>
                              {topic.category.replace('_', '/')}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{topic.count} mentions</span>
                            <span className={getSentimentColor(topic.sentiment)}>
                              <i className={`${getSentimentIcon(topic.sentiment)} mr-1`}></i>
                              {topic.sentiment}
                            </span>
                            <span>
                              {topic.lastMentioned && formatDistanceToNow(new Date(topic.lastMentioned), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${topic.growth > 0 ? 'text-green-600' : topic.growth < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {topic.growth > 0 && '+'}
                            {topic.growth}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <i className="fas fa-chart-line text-4xl mb-4"></i>
                    <p>No trending topics available yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Articles by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.categoryStats ? (
                  <div className="space-y-4">
                    {Object.entries(analytics.categoryStats)
                      .sort(([,a], [,b]) => b - a)
                      .map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge className={getCategoryColor(category)}>
                              {category.replace('_', '/')}
                            </Badge>
                          </div>
                          <div className="text-lg font-semibold">{count}</div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <i className="fas fa-tags text-4xl mb-4"></i>
                    <p>No category data available yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.sentimentStats ? (
                  <div className="space-y-4">
                    {Object.entries(analytics.sentimentStats)
                      .sort(([,a], [,b]) => b - a)
                      .map(([sentiment, count]) => (
                        <div key={sentiment} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <i className={`${getSentimentIcon(sentiment)} ${getSentimentColor(sentiment)}`}></i>
                            <span className="font-medium capitalize">{sentiment}</span>
                          </div>
                          <div className="text-lg font-semibold">{count}</div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <i className="fas fa-smile text-4xl mb-4"></i>
                    <p>No sentiment data available yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics?.sourceStats ? (
                    <div className="space-y-4">
                      {Object.entries(analytics.sourceStats)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 10)
                        .map(([source, count]) => (
                          <div key={source} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="font-medium text-tech-blue">{source}</span>
                            </div>
                            <div className="text-lg font-semibold">{count}</div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <i className="fas fa-rss text-4xl mb-4"></i>
                      <p>No source data available yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Most Viewed Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics?.viewStats?.topArticles && analytics.viewStats.topArticles.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.viewStats.topArticles.slice(0, 5).map((article, index) => (
                        <div key={index} className="p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium text-foreground line-clamp-2 mb-2">
                            {article.title}
                          </h4>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <span className="text-tech-blue">{article.source}</span>
                              <span>•</span>
                              <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <i className="fas fa-eye"></i>
                              <span className="font-medium">{article.views}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <i className="fas fa-eye text-4xl mb-4"></i>
                      <p>No view data available yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}