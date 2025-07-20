"use client";

import { useState } from "react";
import { MessageCircle, X, Send, Bot, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ChatbotIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const [quickMessage, setQuickMessage] = useState("");

  const quickQuestions = [
    "What crops should I plant this season?",
    "How do I identify plant diseases?",
    "What's the best fertilizer for tomatoes?",
    "When should I harvest my wheat?",
  ];

  const handleQuickQuestion = (question: string) => {
    localStorage.setItem("agrotech-quick-question", question);
    window.location.href = "/community/chat";
    setIsOpen(false);
  };

  const handleQuickMessageSend = () => {
    if (quickMessage.trim()) {
      localStorage.setItem("agrotech-quick-question", quickMessage.trim());
      window.location.href = "/community/chat";
      setIsOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuickMessageSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              size="lg"
              className={cn(
                "h-14 w-14 rounded-full shadow-lg transition-all duration-300 ease-in-out",
                "bg-primary hover:bg-primary/90 text-primary-foreground",
                "hover:scale-110 hover:shadow-xl",
                "border-2 border-primary-foreground/20"
              )}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </PopoverTrigger>

          <PopoverContent 
            className="w-80 p-0 border-0 shadow-xl"
            side="top"
            align="end"
            sideOffset={10}
          >
            <Card className="border-0 shadow-none p-0">
              <CardContent className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium text-sm">AgroTech AI Assistant</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Online
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6 p-0 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Welcome Message */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">
                      👋 Hi! I'm here to help with all your farming questions. Ask me anything about crops, soil, pests, or farming techniques!
                    </p>
                  </CardContent>
                </Card>

                {/* Quick Message Input */}
                <div className="space-y-2">
                  <label className="text-xs font-medium">Ask a quick question:</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your farming question..."
                      value={quickMessage}
                      onChange={(e) => setQuickMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 text-sm h-8 px-2"
                    />
                    <Button 
                      onClick={handleQuickMessageSend}
                      disabled={!quickMessage.trim()}
                      size="sm"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Quick Questions */}
                <div className="space-y-2">
                  <label className="text-xs font-medium">Or try these common questions:</label>
                  <div className="space-y-1">
                    {quickQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left h-auto py-2 px-2 whitespace-normal"
                        onClick={() => handleQuickQuestion(question)}
                      >
                        <MessageCircle className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="text-xs">{question}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Full Chat Link */}
                <div className="pt-2 border-t">
                  <Link href="/community/chat" onClick={() => setIsOpen(false)}>
                    <Button variant="default" className="w-full" size="sm">
                      <MessageCircle className="h-3 w-3 mr-2" />
                      Open Full Chat
                      <ArrowUpRight className="h-3 w-3 ml-2" />
                    </Button>
                  </Link>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <label className="text-xs font-medium">I can help with:</label>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-chart-1"></div>
                      <span>Crop planning</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-chart-2"></div>
                      <span>Disease ID</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-chart-3"></div>
                      <span>Soil analysis</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-chart-4"></div>
                      <span>Weather tips</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      </div>

      {/* Pulsing indicator when closed */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 pointer-events-none">
          <div className="h-14 w-14 rounded-full bg-primary/30 animate-ping"></div>
        </div>
      )}
    </>
  );
}