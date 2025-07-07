"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Bot, User, Trash2, MessageCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
}

const dummyBotResponses = [
  "That's a great question! Based on my agricultural knowledge, I'd recommend considering the soil type and climate conditions in your area.",
  "For optimal crop yield, you should focus on proper irrigation timing and nutrient management. Would you like specific recommendations?",
  "Weather patterns play a crucial role in farming decisions. I can help you analyze the best planting times for your region.",
  "Pest management is essential for healthy crops. Have you considered integrated pest management techniques?",
  "Soil pH testing is fundamental for successful farming. Most crops thrive in slightly acidic to neutral conditions (6.0-7.0 pH).",
  "Crop rotation can significantly improve soil health and reduce disease pressure. What crops are you currently growing?",
  "Precision agriculture techniques can help optimize your farming operations. Are you interested in learning about smart farming tools?",
  "Sustainable farming practices not only protect the environment but can also improve long-term profitability.",
  "Market timing is crucial for maximizing profits. I can help you analyze current market trends for your crops.",
  "Organic farming methods are gaining popularity. Would you like to know more about transitioning to organic practices?"
]

const initialBotMessage: Message = {
  id: '1',
  content: "Hi! 👋 How can I help you today? I'm here to assist with all your agricultural questions and farming needs.",
  sender: 'bot',
  timestamp: new Date()
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([initialBotMessage])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('agrotech-chat-messages')
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(parsedMessages)
      } catch (error) {
        console.error('Error loading messages from localStorage:', error)
        setMessages([initialBotMessage])
      }
    }
  }, [])

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('agrotech-chat-messages', JSON.stringify(messages))
  }, [messages])

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const getRandomBotResponse = () => {
    return dummyBotResponses[Math.floor(Math.random() * dummyBotResponses.length)]
  }

  const sendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate bot typing delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getRandomBotResponse(),
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1500 + Math.random() * 1000) // Random delay between 1.5-2.5 seconds
  }

  const clearChat = () => {
    setMessages([initialBotMessage])
    localStorage.removeItem('agrotech-chat-messages')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header - Similar to price prediction page */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AgroTech AI Assistant</h1>
          <p className="text-muted-foreground mt-1">Get instant help with all your agricultural questions</p>
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
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Chat
          </Button>
        </div>
      </div>

      {/* Chat Interface - ChatGPT style */}
      <div className="flex flex-col h-[calc(100vh-10rem)]">
        {/* Messages Area - No border, clean background */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 group ${
                    message.sender === 'user' 
                      ? 'max-w-3xl justify-end' 
                      : 'bg-muted/30 px-4 py-6 justify-start rounded-lg'
                  }`}
                >
                  <div className="flex gap-4 max-w-4xl">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <Avatar className="h-8 w-8">
                        {message.sender === 'bot' ? (
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
                          {message.sender === 'bot' ? 'AgroTech AI' : 'You'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <div className="text-sm text-foreground leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

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

      {/* Additional Info Cards - Similar to price prediction */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">AI Capabilities</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm text-card-foreground">Crop planning and recommendations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-2"></div>
              <span className="text-sm text-card-foreground">Disease and pest identification</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-3"></div>
              <span className="text-sm text-card-foreground">Market insights and pricing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-4"></div>
              <span className="text-sm text-card-foreground">Sustainable farming practices</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">How to Use</h3>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Ask specific questions about your crops, soil, or farming challenges</p>
            <p className="text-sm text-muted-foreground">Get personalized recommendations based on your location and needs</p>
            <p className="text-sm text-muted-foreground">Learn about best practices and modern farming techniques</p>
            <p className="text-sm text-muted-foreground">Available 24/7 for instant agricultural support</p>
          </div>
        </div>
      </div> */}
    </div>
  )
}