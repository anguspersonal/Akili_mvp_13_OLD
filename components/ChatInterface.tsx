import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, Paperclip, MoreVertical, Sparkles, Brain, Zap, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';
import { User } from '../utils/types';
import { flowiseService } from '../utils/flowiseService';
import { SuggestivePrompts } from './SuggestivePrompts';
import { FileAttachment } from './FileAttachment';
import { SpeechInput } from './SpeechInput';
import { MessageFeedback } from './MessageFeedback';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
  error?: boolean;
  chatId?: string;
  feedback?: 'positive' | 'negative' | null;
}

interface ChatInterfaceProps {
  user?: User | null;
  className?: string;
  showWelcome?: boolean;
  contextualInfo?: string;
  enableFileUploads?: boolean;
}

export function ChatInterface({ user, className = '', showWelcome = true, contextualInfo, enableFileUploads = false }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatId, setChatId] = useState<string>('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (showWelcome && messages.length === 0 && user) {
      const welcomeMessage: Message = {
        id: `welcome_${Date.now()}`,
        content: `Hello ${user.name}! 👋 I'm your AI assistant powered by akilii™. I'm here to help you with anything you need${user.nprProfile ? ', and I\'ve been personalized based on your cognitive profile' : ''}. What would you like to explore today?`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [showWelcome, user, messages.length]);

  // Generate chat history for context
  const generateChatHistory = useCallback(() => {
    return messages
      .filter(msg => !msg.error && msg.role !== undefined)
      .slice(-10) // Keep last 10 messages for context
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));
  }, [messages]);

  const sendMessage = async (messageContent?: string, useStreaming = false) => {
    const content = messageContent || inputValue.trim();
    if (!content && (!enableFileUploads || attachedFiles.length === 0)) return;

    // Create user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: content,
      role: 'user',
      timestamp: new Date(),
      chatId: chatId
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Create placeholder for AI response
    const assistantMessageId = `assistant_${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isStreaming: useStreaming,
      chatId: chatId
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const history = generateChatHistory();
      
      if (useStreaming) {
        setIsStreaming(true);
        let streamedContent = '';
        
        const response = await flowiseService.queryStream(
          content,
          user,
          (chunk: string) => {
            streamedContent += chunk;
            setMessages(prev => 
              prev.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: streamedContent, isStreaming: true }
                  : msg
              )
            );
          },
          {
            chatId: chatId || undefined,
            history: history,
            context: contextualInfo
          }
        );

        // Update final message
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessageId 
              ? { 
                  ...msg, 
                  content: response.text || streamedContent,
                  isStreaming: false,
                  error: response.error,
                  chatId: response.chatId
                }
              : msg
          )
        );

        // Update chatId if we got a new one
        if (response.chatId && response.chatId !== chatId) {
          setChatId(response.chatId);
        }

        setIsStreaming(false);
      } else {
        // Regular query
        const response = await flowiseService.query(
          content,
          user,
          {
            chatId: chatId || undefined,
            history: history,
            context: contextualInfo
          }
        );

        // Update assistant message with response
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessageId 
              ? { 
                  ...msg, 
                  content: response.text || "I apologize, but I couldn't generate a response. Please try again.",
                  error: response.error,
                  chatId: response.chatId
                }
              : msg
          )
        );

        // Update chatId if we got a new one
        if (response.chatId && response.chatId !== chatId) {
          setChatId(response.chatId);
        }

        // Show success toast for NPR-adapted responses
        if (user?.nprProfile && !response.error) {
          toast.success(`Response personalized for your cognitive profile! 🧠`, {
            description: "I've tailored my communication style to match your preferences."
          });
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      // Update message with error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { 
                ...msg, 
                content: "I'm experiencing technical difficulties right now. Please try again in a moment! 🔄",
                error: true
              }
            : msg
        )
      );

      toast.error('Connection Error', {
        description: 'Unable to connect to AI services. Please check your connection and try again.'
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setAttachedFiles([]);
    }

    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
    setTimeout(() => {
      sendMessage(prompt);
    }, 100);
  };

  const handleMessageFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, feedback }
          : msg
      )
    );

    // Send feedback to analytics (could be expanded)
    console.log(`Message ${messageId} feedback: ${feedback}`);
    
    toast.success(
      feedback === 'positive' ? 'Thank you for your feedback! 👍' : 'Thanks for the feedback. I\'ll improve! 📝'
    );
  };

  const clearChat = () => {
    setMessages([]);
    setChatId('');
    if (showWelcome && user) {
      const welcomeMessage: Message = {
        id: `welcome_${Date.now()}`,
        content: `Hello ${user.name}! 👋 Ready for a fresh conversation? What would you like to explore?`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
    toast.success('Chat cleared! Starting fresh conversation.');
  };

  return (
    <div className={`flex flex-col h-full akilii-glass-elevated rounded-3xl border border-border overflow-hidden ${className}`}>
      
      {/* Chat Header */}
      <motion.div 
        className="flex-shrink-0 p-4 border-b border-border akilii-glass-premium"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-10 h-10 akilii-gradient-primary rounded-xl flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <div>
              <h3 className="font-bold text-foreground">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">
                {user?.nprProfile ? 'NPR-Personalized' : 'Powered by akilii™'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {user?.nprProfile && (
              <Badge className="text-xs akilii-gradient-accent text-primary-foreground border-0">
                <Brain className="h-3 w-3 mr-1" />
                Adaptive
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.role === 'user' ? 'ml-12' : 'mr-12'}`}>
                  <Card className={`p-4 ${
                    message.role === 'user' 
                      ? 'akilii-gradient-secondary text-primary-foreground' 
                      : message.error 
                        ? 'border-destructive bg-destructive/10' 
                        : 'akilii-glass border-border'
                  }`}>
                    <div className="space-y-2">
                      {/* Message Content */}
                      <div className={`text-sm leading-relaxed ${
                        message.role === 'user' ? 'text-primary-foreground' : 'text-foreground'
                      }`}>
                        {message.isStreaming ? (
                          <div className="flex items-center gap-2">
                            <span>{message.content}</span>
                            <motion.div 
                              className="w-2 h-4 bg-current rounded-sm"
                              animate={{ opacity: [1, 0] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                            />
                          </div>
                        ) : (
                          message.content
                        )}
                      </div>

                      {/* Message Footer */}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${
                          message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>

                        {/* Message Feedback for AI responses */}
                        {message.role === 'assistant' && !message.isStreaming && !message.error && (
                          <MessageFeedback
                            messageId={message.id}
                            currentFeedback={message.feedback}
                            onFeedback={handleMessageFeedback}
                          />
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {isLoading && !isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-start"
            >
              <div className="max-w-[80%] mr-12">
                <Card className="p-4 akilii-glass border-border">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <motion.div 
                      className="flex gap-1"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 bg-current rounded-full" />
                      <div className="w-2 h-2 bg-current rounded-full" />
                      <div className="w-2 h-2 bg-current rounded-full" />
                    </motion.div>
                    <span className="text-sm">
                      {user?.nprProfile ? 'Personalizing response...' : 'Thinking...'}
                    </span>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Suggested Prompts (shown when no messages or conversation is short) */}
      {messages.length <= 1 && (
        <motion.div 
          className="flex-shrink-0 p-4 border-t border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <SuggestivePrompts 
            user={user} 
            onPromptSelect={handleSuggestedPrompt}
            disabled={isLoading}
          />
        </motion.div>
      )}

      {/* Input Area */}
      <motion.div 
        className="flex-shrink-0 p-4 border-t border-border akilii-glass-premium"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="space-y-3">
          
          {/* File Attachments */}
          {enableFileUploads && attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <Paperclip className="h-3 w-3 mr-1" />
                  {file.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Input Row */}
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  user?.nprProfile 
                    ? "Ask me anything... I'll adapt my response to your cognitive style! 🧠"
                    : "Type your message..."
                }
                className="resize-none input-responsive akilii-glass border-border focus:border-accent"
                rows={1}
                disabled={isLoading}
                style={{
                  minHeight: '2.5rem',
                  maxHeight: '6rem'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <SpeechInput
                onTranscript={(transcript) => setInputValue(transcript)}
                disabled={isLoading}
              />
              
              {enableFileUploads && (
                <FileAttachment
                  onFilesSelected={setAttachedFiles}
                  disabled={isLoading}
                />
              )}

              <Button
                onClick={() => sendMessage()}
                disabled={isLoading || (!inputValue.trim() && (!enableFileUploads || attachedFiles.length === 0))}
                size="sm"
                className="akilii-gradient-primary text-primary-foreground hover:scale-105 transition-transform"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {user?.nprProfile ? (
                <span className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  NPR-Adaptive AI
                </span>
              ) : (
                'Press Enter to send, Shift+Enter for new line'
              )}
            </span>
            
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-akilii-pink" />
              Powered by akilii™
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ChatInterface;