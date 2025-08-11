import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Bookmarks from "@/pages/bookmarks";
import Analytics from "@/pages/analytics";

function Router() {
  // Authentication removed - show news feed directly as home page
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/bookmarks" component={Bookmarks} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/article/:id" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
