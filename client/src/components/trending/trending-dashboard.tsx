import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingTopic } from "@/types/news";

export default function TrendingDashboard() {
  const { data: trendingTopics = [], isLoading } = useQuery({
    queryKey: ['/api/trending', { range: 'today' }],
    retry: 1,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <i className="fas fa-trending-up mr-2 text-tech-green"></i>
            Trending Today
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const formatGrowthRate = (rate?: number) => {
    if (!rate) return '+0%';
    return rate > 0 ? `+${Math.round(rate)}%` : `${Math.round(rate)}%`;
  };

  const getGrowthColor = (rate?: number) => {
    if (!rate) return 'text-muted-foreground';
    if (rate > 50) return 'text-tech-green font-semibold';
    if (rate > 20) return 'text-tech-green';
    if (rate > 0) return 'text-yellow-600';
    return 'text-red-500';
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Sort by growth rate and take top items
  const topTrending = trendingTopics
    .sort((a: TrendingTopic, b: TrendingTopic) => (b.growthRate || 0) - (a.growthRate || 0))
    .slice(0, 6);

  return (
    <Card data-testid="trending-dashboard">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <i className="fas fa-trending-up mr-2 text-tech-green"></i>
          Trending Today
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topTrending.length === 0 ? (
          <div className="text-center py-6">
            <i className="fas fa-chart-line text-muted-foreground text-2xl mb-2"></i>
            <p className="text-sm text-muted-foreground">
              No trending topics available yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Check back later for trending analysis.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {topTrending.map((topic: TrendingTopic, index: number) => (
              <div
                key={topic.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                data-testid={`trending-item-${index}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground truncate" data-testid={`trending-topic-${index}`}>
                      {capitalizeFirst(topic.topic)}
                    </span>
                    {topic.category && (
                      <Badge variant="outline" className="text-xs py-0 px-1">
                        {topic.category.replace('_', '/')}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-muted-foreground" data-testid={`trending-count-${index}`}>
                      {topic.count} mentions
                    </span>
                    <span className={`text-xs ${getGrowthColor(topic.growthRate)}`} data-testid={`trending-growth-${index}`}>
                      {formatGrowthRate(topic.growthRate)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {topic.growthRate && topic.growthRate > 0 && (
                    <i className="fas fa-arrow-up text-tech-green text-xs"></i>
                  )}
                  {topic.growthRate && topic.growthRate < 0 && (
                    <i className="fas fa-arrow-down text-red-500 text-xs"></i>
                  )}
                </div>
              </div>
            ))}
            
            {/* Summary Stats */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-tech-green" data-testid="trending-total-topics">
                    {trendingTopics.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Active Topics
                  </div>
                </div>
                
                <div>
                  <div className="text-lg font-semibold text-tech-blue" data-testid="trending-total-mentions">
                    {trendingTopics.reduce((sum: number, topic: TrendingTopic) => sum + topic.count, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Mentions
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-center">
                <div className="text-xs text-muted-foreground flex items-center justify-center">
                  <i className="fas fa-clock mr-1"></i>
                  <span>Updated hourly</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
