import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TrendingDashboard from "@/components/trending/trending-dashboard";
import { SearchFilters, CATEGORIES, TIME_RANGES } from "@/types/news";

interface SidebarProps {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
}

export default function Sidebar({ filters, onFilterChange }: SidebarProps) {
  const { data: articles = [] } = useQuery({
    queryKey: ['/api/articles', { limit: 1000 }], // Get all for counting
    retry: 1,
  }) as { data: any[] };

  // Calculate category counts
  const categoryCounts = articles.reduce((acc: Record<string, number>, article: any) => {
    acc[article.category] = (acc[article.category] || 0) + 1;
    acc.all = (acc.all || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Category Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <i className="fas fa-filter mr-2 text-tech-blue"></i>
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(CATEGORIES).map(([key, label]) => (
            <Button
              key={key}
              variant={filters.category === key ? "default" : "ghost"}
              className="w-full justify-between"
              onClick={() => onFilterChange({ category: key })}
              data-testid={`button-category-${key}`}
            >
              <span>{label}</span>
              <Badge variant="secondary" className="ml-2">
                {categoryCounts[key] || 0}
              </Badge>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <TrendingDashboard />

      {/* Time Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <i className="fas fa-clock mr-2 text-muted-foreground"></i>
            Time Range
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(TIME_RANGES).map(([key, label]) => (
            <Button
              key={key}
              variant={filters.timeRange === key ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => onFilterChange({ timeRange: key as any })}
              data-testid={`button-time-${key}`}
            >
              {label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <i className="fas fa-chart-bar mr-2 text-tech-green"></i>
            Today's Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Articles</span>
            <span className="font-semibold" data-testid="text-total-articles">
              {categoryCounts.all || 0}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">AI/ML News</span>
            <span className="font-semibold text-tech-green" data-testid="text-ai-articles">
              {categoryCounts.ai_ml || 0}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Startup News</span>
            <span className="font-semibold text-purple-600" data-testid="text-startup-articles">
              {categoryCounts.startups || 0}
            </span>
          </div>
          
          <div className="pt-2 border-t border-border">
            <div className="flex items-center text-xs text-muted-foreground">
              <i className="fas fa-sync-alt mr-1"></i>
              <span>Auto-updated every 5 min</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
