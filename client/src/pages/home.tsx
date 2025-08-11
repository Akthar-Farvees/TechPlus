import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import NewsFeed from "@/components/news/news-feed";
import AIChat from "@/components/chat/ai-chat";
import MobileChat from "@/components/chat/mobile-chat";
import ArticleModal from "@/components/news/article-modal";
import { SearchFilters, ArticleWithSource } from "@/types/news";

export default function Home() {
  const { user } = useAuth();
  const { isConnected } = useWebSocket();
  
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    timeRange: 'today',
    page: 1,
    limit: 20,
  });
  
  const [selectedArticle, setSelectedArticle] = useState<ArticleWithSource | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(false);

  const { data: articles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ['/api/articles', filters],
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header 
        onSearch={(query) => handleFilterChange({ search: query })}
        isConnected={isConnected}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-6">
          {/* Sidebar - Hidden on mobile, shows as collapsible filters */}
          <aside className="lg:col-span-1 hidden md:block">
            <Sidebar
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-2 md:col-span-1 col-span-1">
            {/* Mobile Category Filter */}
            <div className="md:hidden mb-4">
              <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
                {Object.entries({
                  all: 'All',
                  ai_ml: 'AI/ML',
                  startups: 'Startups',
                  cybersecurity: 'Security',
                  mobile: 'Mobile',
                  web3: 'Web3',
                  others: 'Others'
                }).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => handleFilterChange({ category: key })}
                    className={`whitespace-nowrap px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      filters.category === key
                        ? 'bg-tech-blue text-white border-tech-blue'
                        : 'bg-background text-muted-foreground border-border hover:border-tech-blue/50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <NewsFeed
              articles={articles}
              isLoading={articlesLoading}
              onArticleSelect={handleArticleSelect}
              onLoadMore={() => {
                const nextPage = (filters.page || 1) + 1;
                setFilters(prev => ({ ...prev, page: nextPage }));
              }}
              filters={filters}
            />
          </main>

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
        className="lg:hidden fixed bottom-4 right-4 w-12 h-12 sm:w-14 sm:h-14 bg-tech-blue text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-40"
        data-testid="button-mobile-chat"
        aria-label="Open AI chat"
      >
        <i className="fas fa-robot text-base sm:text-lg"></i>
      </button>

      {/* Article Modal */}
      <ArticleModal
        article={selectedArticle}
        isOpen={showArticleModal}
        onClose={handleCloseArticle}
        onChatOpen={(article) => {
          setSelectedArticle(article);
          setShowMobileChat(true);
        }}
      />
    </div>
  );
}
