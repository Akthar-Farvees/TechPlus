import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ArticleWithSource, ChatMessage } from "@/types/news";
import { formatDistanceToNow } from "date-fns";

interface AIChatProps {
  selectedArticle: ArticleWithSource | null;
}

export default function AIChat({ selectedArticle }: AIChatProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatHistory = [], refetch: refetchHistory } = useQuery({
    queryKey: ['/api/chat', selectedArticle?.id, 'history'],
    enabled: !!selectedArticle?.id,
    retry: 1,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      if (!selectedArticle) throw new Error('No article selected');
      
      const response = await apiRequest('POST', '/api/chat/message', {
        articleId: selectedArticle.id,
        message: messageText,
      });
      
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      refetchHistory();
      queryClient.invalidateQueries({ queryKey: ['/api/chat'] });
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
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const summarizeMutation = useMutation({
    mutationFn: async (mode: 'short' | 'medium' | 'long') => {
      if (!selectedArticle) throw new Error('No article selected');
      
      const response = await apiRequest('POST', '/api/chat/summarize', {
        articleId: selectedArticle.id,
        mode,
      });
      
      return response.json();
    },
    onSuccess: () => {
      refetchHistory();
      queryClient.invalidateQueries({ queryKey: ['/api/chat'] });
      
      toast({
        title: "Summary generated",
        description: "AI has summarized the article for you.",
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
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedArticle) return;
    
    sendMessageMutation.mutate(message.trim());
  };

  const handleQuickPrompt = (prompt: string) => {
    if (!selectedArticle) return;
    
    let fullPrompt = "";
    switch (prompt) {
      case 'summarize':
        summarizeMutation.mutate('medium');
        return;
      case 'explain':
        fullPrompt = "Can you explain the key concepts mentioned in this article in simple terms?";
        break;
      case 'impact':
        fullPrompt = "What is the potential impact of this news on the tech industry?";
        break;
      default:
        fullPrompt = prompt;
    }
    
    sendMessageMutation.mutate(fullPrompt);
  };

  const formatMessageTime = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  if (isMinimized) {
    return (
      <Card className="h-fit sticky top-24">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <i className="fas fa-robot mr-2 text-tech-blue"></i>
              AI Assistant
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(false)}
              className="h-6 w-6"
              data-testid="button-expand-chat"
              aria-label="Expand chat"
            >
              <i className="fas fa-expand-alt text-xs"></i>
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-fit sticky top-24" data-testid="chat-desktop">
      {/* Chat Header */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <i className="fas fa-robot mr-2 text-tech-blue"></i>
            AI Assistant
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(true)}
            className="h-6 w-6"
            data-testid="button-minimize-chat"
            aria-label="Minimize chat"
          >
            <i className="fas fa-minus text-xs"></i>
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {selectedArticle ? 'Ask about this article or tech topics' : 'Select an article to start chatting'}
        </p>
        
        {selectedArticle && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              {selectedArticle.source?.name || 'Unknown Source'}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Chat Messages */}
        <ScrollArea className="h-80 px-4" data-testid="chat-messages">
          {!selectedArticle ? (
            <div className="flex items-center justify-center h-full text-center">
              <div className="space-y-2">
                <i className="fas fa-newspaper text-muted-foreground text-2xl"></i>
                <p className="text-sm text-muted-foreground">
                  Select an article to start an AI conversation
                </p>
              </div>
            </div>
          ) : chatHistory.length === 0 ? (
            <div className="space-y-4">
              {/* Welcome Message */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-tech-blue rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-robot text-white text-sm"></i>
                </div>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-sm">
                      👋 Hi! I'm ready to help you understand this article. 
                      You can ask me to summarize it, explain concepts, or discuss its implications.
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    Just now
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {chatHistory.map((msg: ChatMessage, index: number) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 ${
                    msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                  data-testid={`message-${index}`}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    {msg.role === 'assistant' ? (
                      <div className="w-8 h-8 bg-tech-blue rounded-full flex items-center justify-center">
                        <i className="fas fa-robot text-white text-sm"></i>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-primary-foreground text-sm"></i>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div
                      className={`rounded-lg p-3 max-w-sm ${
                        msg.role === 'user'
                          ? 'bg-tech-blue text-white ml-auto'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <span
                      className={`text-xs text-muted-foreground mt-1 block ${
                        msg.role === 'user' ? 'text-right' : ''
                      }`}
                    >
                      {formatMessageTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              
              {sendMessageMutation.isPending && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-tech-blue rounded-full flex items-center justify-center">
                    <i className="fas fa-robot text-white text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <div className="bg-muted rounded-lg p-3 max-w-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Chat Input */}
        <div className="p-4 border-t border-border">
          <form onSubmit={handleSendMessage} className="space-y-3">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={selectedArticle ? "Ask about this article..." : "Select an article first"}
                disabled={!selectedArticle || sendMessageMutation.isPending}
                className="flex-1 text-sm"
                data-testid="input-chat-message"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!message.trim() || !selectedArticle || sendMessageMutation.isPending}
                className="bg-tech-blue hover:bg-blue-600"
                data-testid="button-send-message"
                aria-label="Send message"
              >
                {sendMessageMutation.isPending ? (
                  <i className="fas fa-spinner animate-spin"></i>
                ) : (
                  <i className="fas fa-paper-plane"></i>
                )}
              </Button>
            </div>
            
            {selectedArticle && (
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleQuickPrompt('summarize')}
                  disabled={summarizeMutation.isPending}
                  className="text-xs px-2 py-1 h-auto"
                  data-testid="button-quick-summarize"
                >
                  {summarizeMutation.isPending ? (
                    <i className="fas fa-spinner animate-spin mr-1"></i>
                  ) : null}
                  Summarize
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleQuickPrompt('explain')}
                  disabled={sendMessageMutation.isPending}
                  className="text-xs px-2 py-1 h-auto"
                  data-testid="button-quick-explain"
                >
                  Explain
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleQuickPrompt('impact')}
                  disabled={sendMessageMutation.isPending}
                  className="text-xs px-2 py-1 h-auto"
                  data-testid="button-quick-impact"
                >
                  Impact?
                </Button>
              </div>
            )}
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
