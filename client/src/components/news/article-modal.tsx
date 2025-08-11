import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ArticleWithSource, CATEGORY_COLORS, SENTIMENT_COLORS, SENTIMENT_ICONS } from "@/types/news";
import { formatDistanceToNow } from "date-fns";

interface ArticleModalProps {
  article: ArticleWithSource | null;
  isOpen: boolean;
  onClose: () => void;
  onChatOpen: (article: ArticleWithSource) => void;
}

export default function ArticleModal({ article, isOpen, onClose, onChatOpen }: ArticleModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fullArticle, isLoading } = useQuery({
    queryKey: [`/api/articles/${article?.id}`],
    enabled: !!article?.id && isOpen,
    retry: 1,
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!article) return;
      
      if (article.isBookmarked) {
        await apiRequest('DELETE', `/api/bookmarks/${article.id}`);
      } else {
        await apiRequest('POST', '/api/bookmarks', { articleId: article.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      
      toast({
        title: article?.isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
        description: `Article "${article?.title}" ${article?.isBookmarked ? 'removed from' : 'added to'} your reading list.`,
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
        description: `Failed to ${article?.isBookmarked ? 'remove' : 'add'} bookmark`,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!article) return null;

  const currentArticle = fullArticle || article;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentArticle.title,
        text: currentArticle.snippet || '',
        url: currentArticle.url,
      }).catch(() => {
        navigator.clipboard.writeText(currentArticle.url);
        toast({
          title: "Link copied",
          description: "Article link copied to clipboard",
        });
      });
    } else {
      navigator.clipboard.writeText(currentArticle.url);
      toast({
        title: "Link copied",
        description: "Article link copied to clipboard",
      });
    }
  };

  const handleOpenOriginal = () => {
    window.open(currentArticle.url, '_blank');
  };

  const getTimeAgo = () => {
    if (!currentArticle.publishedAt) return 'Unknown time';
    try {
      return formatDistanceToNow(new Date(currentArticle.publishedAt), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const getSentimentIcon = () => {
    if (!currentArticle.sentiment) return null;
    return SENTIMENT_ICONS[currentArticle.sentiment] || SENTIMENT_ICONS.neutral;
  };

  const getSentimentColor = () => {
    if (!currentArticle.sentiment) return SENTIMENT_COLORS.neutral;
    return SENTIMENT_COLORS[currentArticle.sentiment] || SENTIMENT_COLORS.neutral;
  };

  const getCategoryColor = () => {
    return CATEGORY_COLORS[currentArticle.category] || CATEGORY_COLORS.others;
  };

  const formatContent = (content: string) => {
    // Simple formatting - split into paragraphs
    return content.split('\n\n').filter(p => p.trim()).map((paragraph, index) => (
      <p key={index} className="mb-4 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden mobile-safe-padding" data-testid="modal-article">
        <DialogHeader className="sr-only">
          <DialogTitle>{currentArticle.title}</DialogTitle>
        </DialogHeader>
        {/* Header */}
        <div className="p-6 border-b border-border bg-card">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <span className="font-medium text-tech-blue" data-testid="text-modal-source">
                  {currentArticle.source?.name || 'Unknown Source'}
                </span>
                <span>•</span>
                <span data-testid="text-modal-time">{getTimeAgo()}</span>
                <Badge className={`text-xs ${getCategoryColor()}`} data-testid="badge-modal-category">
                  {currentArticle.category ? currentArticle.category.replace('_', '/') : 'others'}
                </Badge>
                {currentArticle.sentiment && (
                  <span className={`flex items-center text-sm ${getSentimentColor()}`} data-testid="text-modal-sentiment">
                    <i className={`${getSentimentIcon()} mr-1`}></i>
                    {currentArticle.sentiment.charAt(0).toUpperCase() + currentArticle.sentiment.slice(1)}
                  </span>
                )}
              </div>
              
              <h1 className="text-2xl font-bold text-foreground leading-tight" data-testid="text-modal-title">
                {currentArticle.title}
              </h1>
              
              {currentArticle.viewCount > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <i className="fas fa-eye mr-1"></i>
                  {currentArticle.viewCount} views
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onChatOpen(currentArticle)}
                className="text-tech-blue hover:text-blue-600 border-tech-blue hover:bg-tech-blue/10"
                data-testid="button-modal-chat"
                aria-label="Chat with AI about this article"
              >
                <i className="fas fa-robot"></i>
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => bookmarkMutation.mutate()}
                disabled={bookmarkMutation.isPending}
                className={`${currentArticle.isBookmarked ? 'text-tech-blue border-tech-blue bg-tech-blue/10' : 'text-muted-foreground'} hover:text-tech-blue hover:border-tech-blue`}
                data-testid="button-modal-bookmark"
                aria-label={currentArticle.isBookmarked ? "Remove bookmark" : "Add bookmark"}
              >
                <i className={`${currentArticle.isBookmarked ? 'fas' : 'far'} fa-bookmark`}></i>
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-modal-share"
                aria-label="Share article"
              >
                <i className="fas fa-share"></i>
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleOpenOriginal}
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-modal-external"
                aria-label="Open original article"
              >
                <i className="fas fa-external-link-alt"></i>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-modal-close"
                aria-label="Close modal"
              >
                <i className="fas fa-times"></i>
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
              </div>
            ) : (
              <div className="prose dark:prose-invert max-w-none" data-testid="content-modal-article">
                {currentArticle.content ? (
                  formatContent(currentArticle.content)
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <i className="fas fa-file-alt text-4xl mb-4"></i>
                    <p>Full content not available. Please visit the original article.</p>
                    <Button
                      variant="outline"
                      onClick={handleOpenOriginal}
                      className="mt-4"
                      data-testid="button-read-original"
                    >
                      <i className="fas fa-external-link-alt mr-2"></i>
                      Read Original Article
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Related Articles */}
        {currentArticle.relatedArticles && currentArticle.relatedArticles.length > 0 && (
          <>
            <Separator />
            <div className="p-6 bg-muted/30">
              <h3 className="font-semibold mb-4 text-foreground">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentArticle.relatedArticles.slice(0, 3).map((relatedArticle) => (
                  <div
                    key={relatedArticle.id}
                    className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      onClose();
                      // Would need to trigger article selection in parent
                    }}
                    data-testid={`card-related-${relatedArticle.id}`}
                  >
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
                      <span className="font-medium text-tech-blue">
                        {relatedArticle.source?.name || 'Unknown'}
                      </span>
                      <Badge className={`text-xs ${getCategoryColor()}`}>
                        {relatedArticle.category.replace('_', '/')}
                      </Badge>
                    </div>
                    
                    <h4 className="font-medium text-sm line-clamp-2 text-foreground">
                      {relatedArticle.title}
                    </h4>
                    
                    {relatedArticle.snippet && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {relatedArticle.snippet}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
