import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { aiService } from "./services/aiService";
import { newsService } from "./services/newsService";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - Using Replit Auth
  await setupAuth(app);

  // Start news processing
  newsService.startPeriodicUpdate();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Articles routes
  app.get('/api/articles', async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const { category, timeRange, search, page = 1, limit = 20 } = req.query;
      
      const articles = await storage.getArticles({
        category: category as string,
        timeRange: timeRange as string,
        search: search as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        userId,
      });

      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get('/api/articles/:id', async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      
      const article = await storage.getArticleById(id, userId);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      // Increment view count
      await storage.incrementArticleViews(id);

      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.get('/api/search', async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }

      const articles = await storage.searchArticles(q, userId);
      res.json(articles);
    } catch (error) {
      console.error("Error searching articles:", error);
      res.status(500).json({ message: "Failed to search articles" });
    }
  });

  // Bookmarks routes
  app.get('/api/bookmarks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookmarks = await storage.getBookmarks(userId);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  app.post('/api/bookmarks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { articleId } = req.body;

      if (!articleId) {
        return res.status(400).json({ message: "Article ID is required" });
      }

      // Check if already bookmarked
      const isAlreadyBookmarked = await storage.isBookmarked(userId, articleId);
      if (isAlreadyBookmarked) {
        return res.status(409).json({ message: "Article already bookmarked" });
      }

      const bookmark = await storage.createBookmark({ userId, articleId });
      res.status(201).json(bookmark);
    } catch (error) {
      console.error("Error creating bookmark:", error);
      res.status(500).json({ message: "Failed to create bookmark" });
    }
  });

  app.delete('/api/bookmarks/:articleId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { articleId } = req.params;

      await storage.deleteBookmark(userId, articleId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      res.status(500).json({ message: "Failed to delete bookmark" });
    }
  });

  // AI Chat routes
  app.post('/api/chat/summarize', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { articleId, mode = 'medium' } = req.body;

      if (!articleId) {
        return res.status(400).json({ message: "Article ID is required" });
      }

      const summary = await aiService.summarizeArticle({
        articleId,
        mode: mode as 'short' | 'medium' | 'long',
        userId,
      });

      res.json({ summary });
    } catch (error) {
      console.error("Error summarizing article:", error);
      res.status(500).json({ message: "Failed to summarize article" });
    }
  });

  app.post('/api/chat/message', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { articleId, message } = req.body;

      if (!articleId || !message) {
        return res.status(400).json({ message: "Article ID and message are required" });
      }

      // Get conversation history
      const conversationHistory = await aiService.getChatHistory(userId, articleId);

      const response = await aiService.chatAboutArticle({
        articleId,
        message,
        userId,
        conversationHistory,
      });

      res.json({ response });
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  app.get('/api/chat/:articleId/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { articleId } = req.params;

      const history = await aiService.getChatHistory(userId, articleId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  app.post('/api/chat/compare', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { articleIds } = req.body;

      if (!Array.isArray(articleIds) || articleIds.length < 2) {
        return res.status(400).json({ message: "At least 2 article IDs are required" });
      }

      const comparison = await aiService.compareArticles(articleIds, userId);
      res.json({ comparison });
    } catch (error) {
      console.error("Error comparing articles:", error);
      res.status(500).json({ message: "Failed to compare articles" });
    }
  });

  // Trending routes
  app.get('/api/trending', async (req: any, res) => {
    try {
      const { range = 'today' } = req.query;
      const trending = await storage.getTrendingTopics(range as string);
      res.json(trending);
    } catch (error) {
      console.error("Error fetching trending topics:", error);
      res.status(500).json({ message: "Failed to fetch trending topics" });
    }
  });

  // Sources routes
  app.get('/api/sources', async (req: any, res) => {
    try {
      const sources = await storage.getSources();
      res.json(sources);
    } catch (error) {
      console.error("Error fetching sources:", error);
      res.status(500).json({ message: "Failed to fetch sources" });
    }
  });

  // Manual refresh route for testing
  app.post('/api/refresh', isAuthenticated, async (req: any, res) => {
    try {
      await newsService.processNewArticles();
      res.json({ message: "News refresh completed" });
    } catch (error) {
      console.error("Error refreshing news:", error);
      res.status(500).json({ message: "Failed to refresh news" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'subscribe') {
          // Handle subscription to specific topics
          console.log('Client subscribed to:', data.topic);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });

    // Send initial connection message
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ 
        type: 'connected', 
        message: 'Connected to TechPulse real-time updates' 
      }));
    }
  });

  // Broadcast updates to connected clients
  const broadcastUpdate = (type: string, data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, data }));
      }
    });
  };

  // Example: Broadcast when new articles are available
  setInterval(() => {
    broadcastUpdate('heartbeat', { timestamp: Date.now() });
  }, 30000); // Every 30 seconds

  return httpServer;
}
