import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  const handleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-tech-blue rounded-lg flex items-center justify-center">
                <i className="fas fa-bolt text-white text-lg"></i>
              </div>
              <h1 className="text-xl font-bold text-foreground">TechPulse</h1>
            </div>
            
            <div className="flex items-center space-x-4">
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
                  <i className="fas fa-moon text-slate-600"></i>
                )}
              </Button>
              
              <Button onClick={handleLogin} data-testid="button-login">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                AI-Powered Tech News &{' '}
                <span className="bg-gradient-to-r from-tech-blue to-tech-green bg-clip-text text-transparent">
                  Discussion Platform
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Stay ahead of the tech curve with intelligent news aggregation, AI-powered summaries, 
                and context-aware discussions. Your personalized gateway to what matters in technology.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" onClick={handleLogin} className="px-8 py-3" data-testid="button-hero-login">
                <i className="fas fa-rocket mr-2"></i>
                Start Exploring
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3" data-testid="button-learn-more">
                <i className="fas fa-play mr-2"></i>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why TechPulse?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Combining the best of tech journalism with cutting-edge AI to deliver 
              a superior news experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-tech-blue/10 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-robot text-tech-blue text-xl"></i>
                </div>
                <CardTitle>AI-Powered Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Chat with articles using advanced AI. Get summaries, ask questions, 
                  and discover insights you might have missed.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-tech-green/10 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-chart-trending-up text-tech-green text-xl"></i>
                </div>
                <CardTitle>Trending Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Real-time analysis of trending topics, sentiment tracking, 
                  and predictive insights about tech developments.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-filter text-purple-500 text-xl"></i>
                </div>
                <CardTitle>Smart Filtering</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Category-based filtering, personalized recommendations, 
                  and intelligent content curation tailored to your interests.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-rss text-orange-500 text-xl"></i>
                </div>
                <CardTitle>Multi-Source Aggregation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Curated content from TechCrunch, The Verge, Hacker News, 
                  and other top tech publications in one place.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-bookmark text-pink-500 text-xl"></i>
                </div>
                <CardTitle>Personal Library</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Save articles, maintain reading lists, and access your 
                  bookmarked content offline whenever you need it.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-mobile-alt text-cyan-500 text-xl"></i>
                </div>
                <CardTitle>Mobile-First Design</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Optimized for all devices with a responsive design that 
                  works seamlessly on desktop, tablet, and mobile.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-border bg-gradient-to-r from-tech-blue/5 to-tech-green/5">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Transform Your Tech News Experience?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of tech professionals who stay informed with AI-powered insights.
              </p>
              <Button size="lg" onClick={handleLogin} className="px-8 py-3" data-testid="button-cta-login">
                <i className="fas fa-bolt mr-2"></i>
                Get Started Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-tech-blue rounded-lg flex items-center justify-center">
                <i className="fas fa-bolt text-white text-sm"></i>
              </div>
              <span className="font-semibold text-foreground">TechPulse</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors" data-testid="link-about">
                About
              </a>
              <a href="#" className="hover:text-foreground transition-colors" data-testid="link-privacy">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors" data-testid="link-terms">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors" data-testid="link-contact">
                Contact
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2024 TechPulse. All rights reserved. Powered by AI for a smarter tech news experience.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
