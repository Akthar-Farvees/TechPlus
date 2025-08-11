import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ArticleCard from "./article-card";
import { ArticleWithSource, SearchFilters } from "@/types/news";

interface NewsFeedProps {
  articles: ArticleWithSource[];
  isLoading: boolean;
  onArticleSelect: (article: ArticleWithSource) => void;
  onLoadMore: () => void;
  filters: SearchFilters;
}

export default function NewsFeed({ 
  articles, 
  isLoading, 
  onArticleSelect, 
  onLoadMore,
  filters 
}: NewsFeedProps) {
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    onLoadMore();
    setTimeout(() => setLoadingMore(false), 1000);
  };

  const getFilterDescription = () => {
    const parts = [];
    
    if (filters.category && filters.category !== 'all') {
      parts.push(filters.category.replace('_', '/').toUpperCase());
    }
    
    if (filters.timeRange) {
      parts.push(filters.timeRange);
    }
    
    if (filters.search) {
      parts.push(`"${filters.search}"`);
    }

    return parts.length > 0 ? ` (${parts.join(', ')})` : '';
  };

  if (isLoading && articles.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-6">
              <div className="flex space-x-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="w-24 h-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feed Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Latest Tech News{getFilterDescription()}
          </h2>
          <p className="text-muted-foreground mt-1">
            {articles.length > 0 
              ? `Found ${articles.length} article${articles.length !== 1 ? 's' : ''}`
              : 'No articles found'
            }
          </p>
        </div>
      </div>

      {/* Articles */}
      {articles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-newspaper text-muted-foreground text-xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No articles found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search terms to find more content.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            data-testid="button-reload"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Refresh Feed
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article, index) => (
            <ArticleCard
              key={article.id}
              article={article}
              onClick={() => onArticleSelect(article)}
              featured={index === 0 && filters.category === 'all'}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {articles.length > 0 && articles.length >= (filters.limit || 20) && (
        <div className="flex justify-center py-8">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-3"
            data-testid="button-load-more"
          >
            {loadingMore ? (
              <>
                <i className="fas fa-spinner animate-spin mr-2"></i>
                Loading...
              </>
            ) : (
              <>
                <i className="fas fa-chevron-down mr-2"></i>
                Load More Articles
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
