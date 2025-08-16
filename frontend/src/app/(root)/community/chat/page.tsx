"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Trash2, MessageCircle, Sparkles, CloudRain, Sprout, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

// API configuration
const API_BASE_URL = "https://agrotech-idut.onrender.com";
// const API_BASE_URL = "http://localhost:8000";

// Create a fixed timestamp to avoid hydration mismatch
const INITIAL_TIMESTAMP = new Date("2025-01-01T00:00:00.000Z");

const initialBotMessage: Message = {
  id: "1",
  content:
    "Hi! 👋 How can I help you today? I'm here to assist with all your agricultural questions and farming needs.",
  sender: "bot",
  timestamp: INITIAL_TIMESTAMP,
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([initialBotMessage]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if user has started chatting (more than just the initial bot message)
  const hasUserStartedChat = messages.length > 1;

  // Capability suggestions that appear when user hasn't started chatting
  const capabilities = [
    {
      title: "Weather Expert",
      description: "Get weather forecasts and agricultural insights",
      icon: CloudRain,
      color: "bg-chart-1",
      suggestion: "What's the weather forecast for farming this week?"
    },
    {
      title: "Crop Expert", 
      description: "Advice on planting, growing, and harvesting",
      icon: Sprout,
      color: "bg-chart-2", 
      suggestion: "What crops should I plant this season?"
    },
    {
      title: "Search Expert",
      description: "Find agricultural information and best practices",
      icon: Search,
      color: "bg-chart-3",
      suggestion: "How do I identify and treat plant diseases?"
    }
  ];

  // Function to handle capability suggestion clicks
  const handleCapabilitySuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    // Auto-focus the input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Mark component as mounted to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load messages and session ID from localStorage on component mount
  useEffect(() => {
    if (!isClient) return; // Wait for client-side hydration

    // Check for quick question from chatbot icon
    const quickQuestion = localStorage.getItem("agrotech-quick-question");
    if (quickQuestion) {
      setInputValue(quickQuestion);
      localStorage.removeItem("agrotech-quick-question");
      // Auto-focus the input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
    
    // Load session ID
    const savedSessionId = localStorage.getItem("agrotech-chat-session-id");
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }

    // Load messages
    const savedMessages = localStorage.getItem("agrotech-chat-messages");
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Error loading messages from localStorage:", error);
        setMessages([initialBotMessage]);
      }
    }
  }, [isClient]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem("agrotech-chat-messages", JSON.stringify(messages));
  }, [messages]);

  // Save session ID to localStorage whenever it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem("agrotech-chat-session-id", sessionId);
    }
  }, [sessionId]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Convert plain text response to markdown format
  const formatResponseAsMarkdown = (content: string) => {
    return (
      content
        // Fix malformed headers with triple asterisks
        .replace(/\*\*\*\s*([^*]+):\*\*/g, "**$1:**")
        // Convert lines with colons to headers (like "Temperature Range:")
        .replace(/^([^:\n|]+):(?!\d)/gm, "**$1:**")
        // Convert hourly data to code blocks for better formatting (but not if it's in a table)
        .replace(/(\d{2}:\d{2}:\s+[^\n|]+)/g, (match) => {
          // Don't format as code if it's part of a table
          if (content.includes("|")) return match;
          return `\`${match}\``;
        })
        // Preserve markdown tables by ensuring proper spacing
        .replace(/(\|[^|\n]*\|)/g, "$1")
        // Convert temperature values to bold (but not in tables)
        .replace(/(\d+\.?\d*°C)/g, (match, temp) => {
          // Don't bold if it's already in a table
          if (
            content.includes("|") &&
            content.indexOf(match) > content.indexOf("|")
          )
            return match;
          return `**${temp}**`;
        })
        // Convert percentage values to bold
        .replace(/(\d+%)/g, "**$1**")
        // Ensure proper line breaks around tables
        .replace(/(\n\|[^|]*\|[^\n]*)/g, "\n$1")
        // Clean up any double spacing
        .replace(/\n\n\n+/g, "\n\n")
    );
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputValue.trim();
    setInputValue("");
    setIsTyping(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
        body: JSON.stringify({
          message: messageToSend,
          session_id: sessionId, // Include current session ID
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update session ID if we got a new one from the server
      if (data.session_id && data.session_id !== sessionId) {
        setSessionId(data.session_id);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          data.reply ||
          "I apologize, but I couldn't generate a response. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setError(
        "Failed to connect to the AI assistant. Please check your connection and try again."
      );

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I'm sorry, but I'm having trouble connecting right now. Please try again in a moment.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = async () => {
    setIsClearing(true);
    try {
      // Clear chat history on the server for this specific session
      const clearUrl = sessionId
        ? `${API_BASE_URL}/chat/clear?session_id=${sessionId}`
        : `${API_BASE_URL}/chat/clear`;

      const response = await fetch(clearUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
      });

      if (!response.ok) {
        console.warn(
          "Failed to clear server chat history, but clearing local chat anyway"
        );
      }

      // Clear local chat and session data
      setMessages([initialBotMessage]);
      setSessionId(null);
      localStorage.removeItem("agrotech-chat-messages");
      localStorage.removeItem("agrotech-chat-session-id");
      setError(null); // Clear any errors too
    } catch (error) {
      console.error("Error clearing chat:", error);
      // Still clear local chat even if server call fails
      setMessages([initialBotMessage]);
      setSessionId(null);
      localStorage.removeItem("agrotech-chat-messages");
      localStorage.removeItem("agrotech-chat-session-id");
      setError(null);
    } finally {
      setIsClearing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    if (!isClient) {
      // Return a static time during SSR to prevent hydration mismatch
      return "12:00 AM";
    }

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header - Similar to price prediction page */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            AgroTech AI Assistant
          </h1>
          <p className="text-muted-foreground mt-1">
            Get instant help with all your agricultural questions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            <Sparkles className="w-4 h-4 mr-1" />
            AI Powered
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            disabled={isClearing}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isClearing ? "Clearing..." : "Clear Chat"}
          </Button>
        </div>
      </div>

      

      {/* Chat Interface - ChatGPT style */}
      <div className="flex flex-col h-[calc(100vh-10rem)]">
        {/* Error Banner */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive"></div>
              <span className="text-sm">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        )}

        {/* Messages Area - No border, clean background */}
        


        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 group ${
                    message.sender === "user"
                      ? "max-w-3xl justify-end"
                      : "bg-muted/30 px-4 py-6 justify-start rounded-lg"
                  }`}
                >
                  <div className="flex gap-4 max-w-4xl">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <Avatar className="h-8 w-8">
                        {message.sender === "bot" ? (
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        ) : (
                          <AvatarFallback className="bg-secondary text-secondary-foreground">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {message.sender === "bot" ? "AgroTech AI" : "You"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <div className="text-sm text-foreground leading-relaxed">
                        {message.sender === "bot" ? (
                          <div
                            className="prose prose-sm max-w-none dark:prose-invert
                            prose-headings:text-foreground prose-headings:font-semibold prose-headings:mb-2 prose-headings:mt-3
                            prose-p:text-foreground prose-p:my-2 prose-p:leading-relaxed
                            prose-strong:text-foreground prose-strong:font-semibold prose-strong:text-blue-600 dark:prose-strong:text-blue-400
                            prose-code:text-primary prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-xs prose-code:font-mono
                            prose-pre:bg-muted prose-pre:text-foreground prose-pre:p-3 prose-pre:rounded
                            prose-ul:text-foreground prose-ul:my-2 prose-ol:text-foreground prose-ol:my-2
                            prose-li:text-foreground prose-li:my-1 prose-li:leading-relaxed
                            prose-blockquote:border-l-primary prose-blockquote:text-foreground"
                          >
                            <ReactMarkdown>
                              {formatResponseAsMarkdown(message.content)}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          message.content
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

{/* Capability Cards - Show only when user hasn't started chatting */}
      {!hasUserStartedChat && (
        <div className="mb-6">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-foreground mb-2">I can help you with:</h2>
            {/* <p className="text-sm text-muted-foreground">Click on any capability to get started</p> */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {capabilities.map((capability, index) => (
              <Card 
                key={index} 
                className="hover:shadow-md transition-all duration-200 border border-border/50 hover:border-primary/30"
                // onClick={() => handleCapabilitySuggestion(capability.suggestion)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${capability.color}/20`}>
                      <capability.icon className={`h-5 w-5 ${capability.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-foreground">
                        {capability.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {capability.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground italic">
                      "{capability.suggestion}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="bg-muted/30 -mx-4 px-4 py-6">
                  <div className="flex gap-4 max-w-4xl mx-auto">
                    <div className="flex-shrink-0">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 space-y-2">
                      <span className="text-sm font-medium">AgroTech AI</span>
                      <div className="flex gap-1 mt-4">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="border-t bg-background">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about farming, crops, or agriculture..."
                  className="pr-12 py-3 text-base border-input focus:border-ring"
                  disabled={isTyping}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <Button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isTyping}
                size="default"
                className="px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send • Shift + Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}