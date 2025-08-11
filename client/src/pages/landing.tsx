import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  // Auto-redirect to news feed after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/news";
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleEnterApp = () => {
    window.location.href = "/news";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header with theme toggle */}
      <header className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-lg w-10 h-10 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? (
            <i className="fas fa-sun text-yellow-400"></i>
          ) : (
            <i className="fas fa-moon text-muted-foreground"></i>
          )}
        </Button>
      </header>

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-6">
            {/* Logo and Brand */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <i className="fas fa-bolt text-white text-2xl"></i>
              </div>
              <div className="text-left">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  TechPulse
                </h1>
                <p className="text-lg text-primary font-medium">
                  AI-Powered Tech News
                </p>
              </div>
            </div>

            {/* Tagline */}
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground leading-tight">
                Stay Ahead of the Tech Curve
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Get the latest tech news, trending topics, and AI-powered insights 
                from top sources like TechCrunch, The Verge, and Hacker News — all in one place.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card/90 transition-colors">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto">
                  <i className="fas fa-newspaper text-blue-600 dark:text-blue-400 text-xl"></i>
                </div>
                <h3 className="font-semibold text-foreground">Real-time News</h3>
                <p className="text-sm text-muted-foreground">
                  Live updates from trusted tech publications
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card/90 transition-colors">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto">
                  <i className="fas fa-robot text-green-600 dark:text-green-400 text-xl"></i>
                </div>
                <h3 className="font-semibold text-foreground">AI Chat</h3>
                <p className="text-sm text-muted-foreground">
                  Discuss articles with AI for deeper insights
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card/90 transition-colors">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto">
                  <i className="fas fa-chart-line text-purple-600 dark:text-purple-400 text-xl"></i>
                </div>
                <h3 className="font-semibold text-foreground">Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Trending topics and sentiment analysis
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleEnterApp}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg font-medium rounded-xl shadow-lg"
              >
                <i className="fas fa-rocket mr-2"></i>
                Enter TechPulse
              </Button>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <i className="fas fa-clock"></i>
                <span>Auto-redirecting in 3 seconds...</span>
              </div>
            </div>

            {/* Source badges */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Powered by leading tech publications
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <i className="fas fa-rss text-orange-500"></i>
                  <span>TechCrunch</span>
                </div>
                <div className="flex items-center space-x-1">
                  <i className="fas fa-rss text-purple-500"></i>
                  <span>The Verge</span>
                </div>
                <div className="flex items-center space-x-1">
                  <i className="fas fa-rss text-orange-600"></i>
                  <span>Hacker News</span>
                </div>
                <div className="flex items-center space-x-1">
                  <i className="fas fa-rss text-red-500"></i>
                  <span>Ars Technica</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Experience the future of tech news with AI-powered insights and real-time updates
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}