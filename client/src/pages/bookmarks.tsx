import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import NewsFeed from "@/components/news/news-feed";
import ArticleModal from "@/components/news/article-modal";
import AIChat from "@/components/chat/ai-chat";
import MobileChat from "@/components/chat/mobile-chat";
import { Button } from "@/components/ui/button";
import { ArticleWithSource, SearchFilters } from "@/types/news";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function Bookmarks() {
  const { isConnected } = useWebSocket();
  
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    page: 1,
    limit: 20,
  });
  
  const [selectedArticle, setSelectedArticle] = useState<ArticleWithSource | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(false);

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ['/api/bookmarks', filters],
    retry: 1,
  }) as { data: ArticleWithSource[], isLoading: boolean };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleArticleSelect = (article: ArticleWithSource) => {
    setSelectedArticle(article);
    setShowArticleModal(true);
  };

  const handleCloseArticle = () => {
    setShowArticleModal(false);
    setSelectedArticle(null);
  };

  const handleChatToggle = () => {
    setShowMobileChat(!showMobileChat);
  };

  const filteredBookmarks = filters.search
    ? bookmarks.filter(bookmark =>
        bookmark.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
        bookmark.snippet?.toLowerCase().includes(filters.search!.toLowerCase()) ||
        bookmark.source?.name.toLowerCase().includes(filters.search!.toLowerCase())
      )
    : bookmarks;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header 
        onSearch={(query) => handleFilterChange({ search: query })}
        isConnected={isConnected}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-6">
          {/* Page Header */}
          <div className="lg:col-span-3 col-span-1">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center">
                    <i className="fas fa-bookmark text-primary mr-3"></i>
                    My Bookmarks
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Your saved articles and reading list
                  </p>
                </div>
                
                {bookmarks.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {filteredBookmarks.length} of {bookmarks.length} articles
                  </div>
                )}
              </div>

              {/* Search within bookmarks */}
              <div className="mb-4 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search your bookmarks..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange({ search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <i className="fas fa-search absolute left-3 top-3 text-muted-foreground text-sm"></i>
                </div>
              </div>
            </div>

            {/* Bookmarks Content */}
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
                    <div className="flex space-x-4">
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-6 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                      </div>
                      <div className="w-24 h-24 bg-muted rounded-lg"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredBookmarks.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-bookmark text-6xl text-muted-foreground/50 mb-4"></i>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {filters.search ? 'No matching bookmarks' : 'No bookmarks yet'}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {filters.search 
                    ? 'Try adjusting your search terms to find the articles you\'re looking for.'
                    : 'Start bookmarking interesting articles to build your reading list. Click the bookmark icon on any article to save it here.'
                  }
                </p>
                {filters.search ? (
                  <Button
                    variant="outline"
                    onClick={() => handleFilterChange({ search: '' })}
                  >
                    Clear Search
                  </Button>
                ) : (
                  <Button
                    onClick={() => window.location.href = '/'}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <i className="fas fa-newspaper mr-2"></i>
                    Browse News
                  </Button>
                )}
              </div>
            ) : (
              <NewsFeed
                articles={filteredBookmarks}
                isLoading={false}
                onArticleSelect={handleArticleSelect}
                onLoadMore={() => {
                  const nextPage = (filters.page || 1) + 1;
                  setFilters(prev => ({ ...prev, page: nextPage }));
                }}
                filters={filters}
              />
            )}
          </div>

          {/* Desktop AI Chat */}
          <aside className="lg:col-span-1 hidden lg:block">
            <AIChat selectedArticle={selectedArticle} />
          </aside>
        </div>
      </div>

      {/* Mobile Chat */}
      <MobileChat
        isOpen={showMobileChat}
        onClose={() => setShowMobileChat(false)}
        selectedArticle={selectedArticle}
      />

      {/* Floating Mobile Chat Button */}
      <button
        onClick={handleChatToggle}
        className="fixed bottom-4 right-4 lg:hidden bg-primary text-primary-foreground w-12 h-12 rounded-full shadow-lg hover:bg-primary/90 transition-colors z-40"
        aria-label="Open AI Chat"
      >
        <i className="fas fa-robot"></i>
      </button>

      {/* Article Modal */}
      <ArticleModal
        article={selectedArticle}
        isOpen={showArticleModal}
        onClose={handleCloseArticle}
        onChatOpen={(article) => {
          setSelectedArticle(article);
          setShowMobileChat(true);
          handleCloseArticle();
        }}
      />
    </div>
  );
}