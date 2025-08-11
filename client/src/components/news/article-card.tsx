import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ArticleWithSource, CATEGORY_COLORS, SENTIMENT_COLORS, SENTIMENT_ICONS } from "@/types/news";
import { formatDistanceToNow } from "date-fns";

interface ArticleCardProps {
  article: ArticleWithSource;
  onClick: () => void;
  featured?: boolean;
}

export default function ArticleCard({ article, onClick, featured = false }: ArticleCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBookmarked, setIsBookmarked] = useState(article.isBookmarked || false);

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        await apiRequest('DELETE', `/api/bookmarks/${article.id}`);
      } else {
        await apiRequest('POST', '/api/bookmarks', { articleId: article.id });
      }
    },
    onSuccess: () => {
      setIsBookmarked(!isBookmarked);
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      
      toast({
        title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
        description: `Article "${article.title}" ${isBookmarked ? 'removed from' : 'added to'} your reading list.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Error",
        description: `Failed to ${isBookmarked ? 'remove' : 'add'} bookmark`,
        variant: "destructive",
      });
    },
  });

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    bookmarkMutation.mutate();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.snippet || '',
        url: article.url,
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(article.url);
        toast({
          title: "Link copied",
          description: "Article link copied to clipboard",
        });
      });
    } else {
      navigator.clipboard.writeText(article.url);
      toast({
        title: "Link copied",
        description: "Article link copied to clipboard",
      });
    }
  };

  const handleAIChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(); // This will open the article modal where chat can be accessed
  };

  const getTimeAgo = () => {
    if (!article.publishedAt) return 'Unknown time';
    try {
      return formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const getSentimentIcon = () => {
    if (!article.sentiment) return null;
    return SENTIMENT_ICONS[article.sentiment] || SENTIMENT_ICONS.neutral;
  };

  const getSentimentColor = () => {
    if (!article.sentiment) return SENTIMENT_COLORS.neutral;
    return SENTIMENT_COLORS[article.sentiment] || SENTIMENT_COLORS.neutral;
  };

  const getCategoryColor = () => {
    return CATEGORY_COLORS[article.category] || CATEGORY_COLORS.others;
  };

  if (featured) {
    return (
      <article 
        className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        onClick={onClick}
        data-testid={`card-article-${article.id}`}
      >
        <div className="md:flex">
          <div className="md:w-1/3">
            {article.thumbnail ? (
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-full h-48 md:h-full object-cover"
                data-testid={`img-thumbnail-${article.id}`}
              />
            ) : (
              <div className="w-full h-48 md:h-full bg-muted flex items-center justify-center">
                <i className="fas fa-newspaper text-muted-foreground text-3xl"></i>
              </div>
            )}
          </div>
          
          <div className="md:w-2/3 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span className="font-medium text-tech-blue" data-testid={`text-source-${article.id}`}>
                  {article.source?.name || 'Unknown Source'}
                </span>
                <span>•</span>
                <span data-testid={`text-time-${article.id}`}>{getTimeAgo()}</span>
                <Badge className={`text-xs ${getCategoryColor()}`} data-testid={`badge-category-${article.id}`}>
                  {article.category.replace('_', '/')}
                </Badge>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBookmark}
                disabled={bookmarkMutation.isPending}
                className={`text-muted-foreground hover:text-tech-blue transition-colors ${isBookmarked ? 'text-tech-blue' : ''}`}
                data-testid={`button-bookmark-${article.id}`}
                aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
              >
                <i className={`${isBookmarked ? 'fas' : 'far'} fa-bookmark`}></i>
              </Button>
            </div>
            
            <h3 className="text-xl font-bold mb-2 line-clamp-2 text-foreground" data-testid={`text-title-${article.id}`}>
              {article.title}
            </h3>
            
            <p className="text-muted-foreground mb-4 line-clamp-3" data-testid={`text-snippet-${article.id}`}>
              {article.snippet || 'No description available.'}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {article.sentiment && (
                  <span className={`flex items-center text-sm ${getSentimentColor()}`} data-testid={`text-sentiment-${article.id}`}>
                    <i className={`${getSentimentIcon()} mr-1`}></i>
                    {article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1)} sentiment
                  </span>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAIChat}
                  className="text-tech-blue hover:text-blue-600 transition-colors"
                  data-testid={`button-ai-chat-${article.id}`}
                >
                  <i className="fas fa-robot mr-1"></i>
                  Ask AI
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid={`button-share-${article.id}`}
                aria-label="Share article"
              >
                <i className="fas fa-share"></i>
              </Button>
            </div>
            
            {article.viewCount > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                <i className="fas fa-eye mr-1"></i>
                {article.viewCount} views
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article 
      className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
      data-testid={`card-article-${article.id}`}
    >
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span className="font-medium text-tech-blue" data-testid={`text-source-${article.id}`}>
                {article.source?.name || 'Unknown Source'}
              </span>
              <span>•</span>
              <span data-testid={`text-time-${article.id}`}>{getTimeAgo()}</span>
              <Badge className={`text-xs ${getCategoryColor()}`} data-testid={`badge-category-${article.id}`}>
                {article.category.replace('_', '/')}
              </Badge>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmark}
              disabled={bookmarkMutation.isPending}
              className={`text-muted-foreground hover:text-tech-blue transition-colors ${isBookmarked ? 'text-tech-blue' : ''}`}
              data-testid={`button-bookmark-${article.id}`}
              aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              <i className={`${isBookmarked ? 'fas' : 'far'} fa-bookmark`}></i>
            </Button>
          </div>
          
          <h3 className="text-lg font-bold mb-2 line-clamp-2 text-foreground" data-testid={`text-title-${article.id}`}>
            {article.title}
          </h3>
          
          <p className="text-muted-foreground mb-4 line-clamp-2" data-testid={`text-snippet-${article.id}`}>
            {article.snippet || 'No description available.'}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {article.sentiment && (
                <span className={`flex items-center text-sm ${getSentimentColor()}`} data-testid={`text-sentiment-${article.id}`}>
                  <i className={`${getSentimentIcon()} mr-1`}></i>
                  {article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1)} sentiment
                </span>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAIChat}
                className="text-tech-blue hover:text-blue-600 transition-colors"
                data-testid={`button-ai-chat-${article.id}`}
              >
                <i className="fas fa-robot mr-1"></i>
                Ask AI
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid={`button-share-${article.id}`}
              aria-label="Share article"
            >
              <i className="fas fa-share"></i>
            </Button>
          </div>
          
          {article.viewCount > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              <i className="fas fa-eye mr-1"></i>
              {article.viewCount} views
            </div>
          )}
        </div>
        
        <div className="w-24 h-24">
          {article.thumbnail ? (
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full h-full object-cover rounded-lg"
              data-testid={`img-thumbnail-${article.id}`}
            />
          ) : (
            <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
              <i className="fas fa-newspaper text-muted-foreground"></i>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
