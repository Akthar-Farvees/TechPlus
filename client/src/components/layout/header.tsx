import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface HeaderProps {
  onSearch: (query: string) => void;
  isConnected: boolean;
}

export default function Header({ onSearch, isConnected }: HeaderProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");

  const { data: bookmarks = [] } = useQuery({
    queryKey: ['/api/bookmarks'],
    retry: false,
  });

  const refreshMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/refresh'),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "News feed refreshed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
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
        description: "Failed to refresh news feed",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim()) {
        onSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, onSearch]);

  return (
    <header className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-tech-blue rounded-lg flex items-center justify-center">
              <i className="fas fa-bolt text-white text-lg"></i>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-foreground">TechPulse</h1>
              {isConnected && (
                <span className="text-xs text-tech-green flex items-center">
                  <i className="fas fa-circle text-xs mr-1"></i>
                  Live
                </span>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search tech news, topics, or ask AI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 bg-background border-input"
                data-testid="input-search"
              />
              <i className="fas fa-search absolute left-3 top-3 text-muted-foreground"></i>
            </form>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              className="rounded-lg"
              data-testid="button-refresh"
              aria-label="Refresh news feed"
            >
              <i className={`fas fa-sync-alt ${refreshMutation.isPending ? 'animate-spin' : ''}`}></i>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg"
              data-testid="button-theme-toggle"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <i className="fas fa-sun text-yellow-400"></i>
              ) : (
                <i className="fas fa-moon text-muted-foreground"></i>
              )}
            </Button>

            {/* Bookmarks */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg relative"
              data-testid="button-bookmarks"
              aria-label="View bookmarks"
            >
              <i className="fas fa-bookmark text-muted-foreground"></i>
              {bookmarks.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-tech-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" data-testid="text-bookmark-count">
                  {bookmarks.length}
                </span>
              )}
            </Button>

            {/* User Profile */}
            <div className="flex items-center space-x-2">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="User profile"
                  className="w-8 h-8 rounded-full object-cover"
                  data-testid="img-user-avatar"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <i className="fas fa-user text-muted-foreground text-sm"></i>
                </div>
              )}
              
              <div className="hidden md:flex flex-col">
                <span className="text-sm font-medium text-foreground" data-testid="text-user-name">
                  {user?.firstName || user?.email || 'User'}
                </span>
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleLogout}
                  className="text-xs text-muted-foreground p-0 h-auto hover:text-foreground"
                  data-testid="button-logout"
                >
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search tech news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 bg-background border-input"
              data-testid="input-search-mobile"
            />
            <i className="fas fa-search absolute left-3 top-3 text-muted-foreground"></i>
          </form>
        </div>
      </div>
    </header>
  );
}
