import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Mic, 
  Paperclip, 
  MoreVertical, 
  Sparkles, 
  Brain, 
  Zap, 
  Heart,
  Download,
  Share,
  Copy,
  RotateCcw,
  MessageSquare,
  Waves,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { toast } from 'sonner@2.0.3';
import { User } from '../utils/types';
import { flowiseService } from '../utils/flowiseService';
import { SuggestivePrompts } from './SuggestivePrompts';
import { FileAttachment } from './FileAttachment';
import { SpeechInput } from './SpeechInput';
import { MessageFeedback } from './MessageFeedback';

export interface EnhancedMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
  error?: boolean;
  chatId?: string;
  feedback?: 'positive' | 'negative' | null;
  tokens?: number;
  processingTime?: number;
  confidence?: number;
  sources?: string[];
  regenerated?: boolean;
}

interface EnhancedChatInterfaceProps {
  user?: User | null;
  className?: string;
  showWelcome?: boolean;
  contextualInfo?: string;
  enableAdvancedFeatures?: boolean;
  enableFileUploads?: boolean;
}

export function EnhancedChatInterface({ 
  user, 
  className = '', 
  showWelcome = true, 
  contextualInfo,
  enableAdvancedFeatures = true,
  enableFileUploads = false
}: EnhancedChatInterfaceProps) {
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatId, setChatId] = useState<string>('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  
  // Advanced features state
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [autoSpeech, setAutoSpeech] = useState(false);
  const [responseLength, setResponseLength] = useState([50]); // Percentage
  const [creativity, setCreativity] = useState([70]); // Percentage
  const [showMetrics, setShowMetrics] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat with enhanced welcome message
  useEffect(() => {
    if (showWelcome && messages.length === 0 && user) {
      const welcomeMessage: EnhancedMessage = {
        id: `welcome_${Date.now()}`,
        content: `Hello ${user.name}! 👋 Welcome to the Enhanced AI Experience powered by akilii™. 

I'm your advanced AI assistant with real-time streaming responses, NPR-adaptive communication${user.nprProfile ? ' (already personalized for your cognitive profile)' : ''}, and enhanced capabilities.

${enableAdvancedFeatures ? '🚀 **Enhanced Features Available:**\n- Real-time streaming responses\n- Advanced conversation analytics\n- Voice synthesis (coming soon)\n- Smart response regeneration\n- Contextual memory' : ''}

What would you like to explore today?`,
        role: 'assistant',
        timestamp: new Date(),
        confidence: 0.95,
        processingTime: 50
      };
      setMessages([welcomeMessage]);
    }
  }, [showWelcome, user, messages.length, enableAdvancedFeatures]);

  // Generate chat history for context
  const generateChatHistory = useCallback(() => {
    return messages
      .filter(msg => !msg.error && msg.role !== undefined && !msg.regenerated)
      .slice(-15) // Keep more messages for enhanced context
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));
  }, [messages]);

  const sendMessage = async (messageContent?: string, isRegeneration = false, originalMessageId?: string) => {
    const content = messageContent || inputValue.trim();
    if (!content && (!enableFileUploads || attachedFiles.length === 0)) return;

    const startTime = Date.now();

    // Create user message (unless this is a regeneration)
    if (!isRegeneration) {
      const userMessage: EnhancedMessage = {
        id: `user_${Date.now()}`,
        content: content,
        role: 'user',
        timestamp: new Date(),
        chatId: chatId,
        tokens: Math.ceil(content.length / 4) // Rough token estimation
      };

      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
    }
    
    setIsLoading(true);

    // Create placeholder for AI response
    const assistantMessageId = originalMessageId || `assistant_${Date.now()}`;
    const assistantMessage: EnhancedMessage = {
      id: assistantMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isStreaming: streamingEnabled,
      chatId: chatId,
      regenerated: isRegeneration
    };

    if (isRegeneration && originalMessageId) {
      // Replace the original message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === originalMessageId 
            ? assistantMessage 
            : msg
        )
      );
    } else {
      // Add new message
      setMessages(prev => [...prev, assistantMessage]);
    }

    try {
      const history = generateChatHistory();
      
      // Enhanced context with advanced settings
      const enhancedContext = [
        contextualInfo,
        `Response length preference: ${responseLength[0]}% of normal`,
        `Creativity level: ${creativity[0]}%`,
        user?.nprProfile ? 'Use NPR-adaptive communication style' : null
      ].filter(Boolean).join(' | ');

      if (streamingEnabled && !isRegeneration) {
        setIsStreaming(true);
        let streamedContent = '';
        let tokenCount = 0;
        
        const response = await flowiseService.queryStream(
          content,
          user,
          (chunk: string) => {
            streamedContent += chunk;
            tokenCount += Math.ceil(chunk.length / 4);
            
            setMessages(prev => 
              prev.map(msg => 
                msg.id === assistantMessageId 
                  ? { 
                      ...msg, 
                      content: streamedContent, 
                      isStreaming: true,
                      tokens: tokenCount
                    }
                  : msg
              )
            );
          },
          {
            chatId: chatId || undefined,
            history: history,
            context: enhancedContext
          }
        );

        const endTime = Date.now();
        const processingTime = endTime - startTime;

        // Update final message with metrics
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessageId 
              ? { 
                  ...msg, 
                  content: response.text || streamedContent,
                  isStreaming: false,
                  error: response.error,
                  chatId: response.chatId,
                  tokens: tokenCount,
                  processingTime: processingTime,
                  confidence: 0.85 + Math.random() * 0.1, // Simulated confidence
                  regenerated: isRegeneration
                }
              : msg
          )
        );

        setIsStreaming(false);
      } else {
        // Regular query
        const response = await flowiseService.query(
          content,
          user,
          {
            chatId: chatId || undefined,
            history: history,
            context: enhancedContext
          }
        );

        const endTime = Date.now();
        const processingTime = endTime - startTime;
        const tokenCount = Math.ceil((response.text || '').length / 4);

        // Update assistant message with response and metrics
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessageId 
              ? { 
                  ...msg, 
                  content: response.text || "I apologize, but I couldn't generate a response. Please try again.",
                  error: response.error,
                  chatId: response.chatId,
                  tokens: tokenCount,
                  processingTime: processingTime,
                  confidence: response.error ? 0 : 0.85 + Math.random() * 0.1,
                  regenerated: isRegeneration
                }
              : msg
          )
        );
      }

      // Update chatId if we got a new one
      if (response.chatId && response.chatId !== chatId) {
        setChatId(response.chatId);
      }

      // Enhanced success notifications
      if (user?.nprProfile && !response.error) {
        if (isRegeneration) {
          toast.success(`Response regenerated with NPR adaptation! 🔄`, {
            description: "I've created a new personalized response for you."
          });
        } else {
          toast.success(`NPR-Adaptive response delivered! 🧠✨`, {
            description: `Personalized in ${Math.round((Date.now() - startTime) / 1000)}s`
          });
        }
      }

      // Auto-speech synthesis (placeholder for future implementation)
      if (autoSpeech && !response.error && !isRegeneration) {
        console.log('🔊 Auto-speech would trigger here');
        // TODO: Implement text-to-speech
      }

    } catch (error) {
      console.error('Enhanced chat error:', error);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      // Update message with error and metrics
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { 
                ...msg, 
                content: "I'm experiencing technical difficulties right now. Please try again in a moment! 🔄",
                error: true,
                processingTime: processingTime,
                confidence: 0
              }
            : msg
        )
      );

      toast.error('Enhanced AI Error', {
        description: `Connection failed after ${Math.round(processingTime / 1000)}s. Please try again.`
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

  const regenerateResponse = (messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message || message.role !== 'assistant') return;

    // Find the user message that prompted this response
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    const userMessage = messages[messageIndex - 1];
    
    if (userMessage && userMessage.role === 'user') {
      sendMessage(userMessage.content, true, messageId);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard! 📋');
  };

  const exportChat = () => {
    const chatData = {
      user: user?.name || 'Anonymous',
      timestamp: new Date().toISOString(),
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        metrics: {
          tokens: msg.tokens,
          processingTime: msg.processingTime,
          confidence: msg.confidence
        }
      }))
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `akilii-chat-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Chat exported successfully! 💾');
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

    // Enhanced feedback tracking
    const message = messages.find(msg => msg.id === messageId);
    console.log(`Enhanced feedback for message ${messageId}:`, {
      feedback,
      processingTime: message?.processingTime,
      confidence: message?.confidence,
      tokens: message?.tokens,
      nprAdapted: !!user?.nprProfile
    });
    
    toast.success(
      feedback === 'positive' 
        ? 'Thank you! This helps improve my NPR adaptation 🎯' 
        : 'Thanks for the feedback! I\'ll learn from this 📚'
    );
  };

  const clearChat = () => {
    setMessages([]);
    setChatId('');
    if (showWelcome && user) {
      const welcomeMessage: EnhancedMessage = {
        id: `welcome_${Date.now()}`,
        content: `Fresh start! Ready for enhanced conversation? 🚀`,
        role: 'assistant',
        timestamp: new Date(),
        confidence: 1.0
      };
      setMessages([welcomeMessage]);
    }
    toast.success('Enhanced chat cleared! 🔄');
  };

  return (
    <div className={`flex flex-col h-full akilii-glass-elevated rounded-3xl border border-border overflow-hidden ${className}`}>
      
      {/* Enhanced Chat Header */}
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
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <div>
              <h3 className="font-bold text-foreground flex items-center gap-2">
                Enhanced AI
                {streamingEnabled && (
                  <Badge className="text-xs akilii-gradient-secondary text-primary-foreground border-0">
                    <Waves className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                )}
              </h3>
              <p className="text-xs text-muted-foreground">
                {user?.nprProfile ? 'NPR-Personalized' : 'Advanced Features'} • Powered by akilii™
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
            
            {showMetrics && (
              <Badge variant="outline" className="text-xs">
                <MessageSquare className="h-3 w-3 mr-1" />
                {messages.filter(m => m.role === 'assistant').length} responses
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={exportChat}
              className="text-muted-foreground hover:text-foreground"
            >
              <Download className="h-4 w-4" />
            </Button>
            
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

        {/* Advanced Controls */}
        {enableAdvancedFeatures && (
          <motion.div 
            className="mt-4 space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              
              {/* Streaming Toggle */}
              <div className="flex items-center justify-between p-2 akilii-glass rounded-lg">
                <span className="text-xs text-muted-foreground">Streaming</span>
                <Switch
                  checked={streamingEnabled}
                  onCheckedChange={setStreamingEnabled}
                  size="sm"
                />
              </div>

              {/* Auto Speech Toggle */}
              <div className="flex items-center justify-between p-2 akilii-glass rounded-lg">
                <span className="text-xs text-muted-foreground">Auto Voice</span>
                <Switch
                  checked={autoSpeech}
                  onCheckedChange={setAutoSpeech}
                  size="sm"
                />
              </div>

              {/* Show Metrics Toggle */}
              <div className="flex items-center justify-between p-2 akilii-glass rounded-lg">
                <span className="text-xs text-muted-foreground">Metrics</span>
                <Switch
                  checked={showMetrics}
                  onCheckedChange={setShowMetrics}
                  size="sm"
                />
              </div>

              {/* Voice Control Placeholder */}
              <div className="flex items-center justify-center p-2 akilii-glass rounded-lg">
                <Button variant="ghost" size="sm" disabled>
                  {autoSpeech ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Advanced Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Response Length: {responseLength[0]}%</label>
                <Slider
                  value={responseLength}
                  onValueChange={setResponseLength}
                  max={100}
                  min={25}
                  step={25}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Creativity: {creativity[0]}%</label>
                <Slider
                  value={creativity}
                  onValueChange={setCreativity}
                  max={100}
                  min={0}
                  step={10}
                  className="w-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Enhanced Messages Area */}
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
                <div className={`max-w-[85%] ${message.role === 'user' ? 'ml-8' : 'mr-8'}`}>
                  <Card className={`p-4 ${
                    message.role === 'user' 
                      ? 'akilii-gradient-secondary text-primary-foreground' 
                      : message.error 
                        ? 'border-destructive bg-destructive/10' 
                        : message.regenerated 
                          ? 'akilii-glass border-akilii-teal bg-akilii-teal/5'
                          : 'akilii-glass border-border'
                  }`}>
                    <div className="space-y-3">
                      
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
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        )}
                      </div>

                      {/* Enhanced Message Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`${
                            message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>

                          {/* Enhanced Metrics */}
                          {showMetrics && message.role === 'assistant' && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {message.tokens && (
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  {message.tokens}t
                                </Badge>
                              )}
                              
                              {message.processingTime && (
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  {Math.round(message.processingTime / 1000)}s
                                </Badge>
                              )}
                              
                              {message.confidence && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs px-1 py-0 ${
                                    message.confidence > 0.8 ? 'border-green-500 text-green-600' :
                                    message.confidence > 0.6 ? 'border-yellow-500 text-yellow-600' :
                                    'border-red-500 text-red-600'
                                  }`}
                                >
                                  {Math.round(message.confidence * 100)}%
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Enhanced Action Buttons */}
                        {message.role === 'assistant' && !message.isStreaming && (
                          <div className="flex items-center gap-1">
                            
                            {/* Copy Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyMessage(message.content)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>

                            {/* Regenerate Button */}
                            {!message.error && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => regenerateResponse(message.id)}
                                disabled={isLoading}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                            )}

                            {/* Message Feedback */}
                            {!message.error && (
                              <MessageFeedback
                                messageId={message.id}
                                currentFeedback={message.feedback}
                                onFeedback={handleMessageFeedback}
                                size="sm"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Enhanced Loading Indicator */}
          {isLoading && !isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-start"
            >
              <div className="max-w-[85%] mr-8">
                <Card className="p-4 akilii-glass border-border">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <motion.div 
                      className="flex gap-1"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 1, 0.3] 
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 bg-current rounded-full" />
                      <div className="w-2 h-2 bg-current rounded-full" />
                      <div className="w-2 h-2 bg-current rounded-full" />
                    </motion.div>
                    <span className="text-sm">
                      {user?.nprProfile 
                        ? 'Crafting NPR-personalized response...' 
                        : 'Processing with enhanced AI...'}
                    </span>
                    {streamingEnabled && (
                      <Badge className="text-xs akilii-gradient-primary text-primary-foreground border-0">
                        <Waves className="h-3 w-3 mr-1" />
                        Streaming Ready
                      </Badge>
                    )}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Enhanced Suggested Prompts */}
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
            enhanced={true}
          />
        </motion.div>
      )}

      {/* Enhanced Input Area */}
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

          {/* Enhanced Input Row */}
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  user?.nprProfile 
                    ? `Enhanced AI ready! I'll adapt to your cognitive style with ${streamingEnabled ? 'real-time' : 'optimized'} responses... 🧠✨`
                    : `Enhanced AI at your service... ${streamingEnabled ? '⚡ Streaming enabled' : '🎯 Precision mode'}`
                }
                className="resize-none input-responsive akilii-glass border-border focus:border-accent pr-20"
                rows={1}
                disabled={isLoading}
                style={{
                  minHeight: '2.5rem',
                  maxHeight: '8rem'
                }}
              />
              
              {/* Character Counter */}
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {inputValue.length}/2000
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex items-center gap-1">
              <SpeechInput
                onTranscript={(transcript) => setInputValue(transcript)}
                disabled={isLoading}
                enhanced={true}
              />
              
              {enableFileUploads && (
                <FileAttachment
                  onFilesSelected={setAttachedFiles}
                  disabled={isLoading}
                  multiple={true}
                />
              )}

              <Button
                onClick={() => sendMessage()}
                disabled={isLoading || (!inputValue.trim() && (!enableFileUploads || attachedFiles.length === 0))}
                size="sm"
                className={`${streamingEnabled ? 'akilii-gradient-primary' : 'akilii-gradient-secondary'} text-primary-foreground hover:scale-105 transition-transform`}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="h-4 w-4" />
                  </motion.div>
                ) : streamingEnabled ? (
                  <Waves className="h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Enhanced Footer Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>
                {user?.nprProfile ? (
                  <span className="flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    NPR-Enhanced AI
                  </span>
                ) : (
                  'Press Enter to send, Shift+Enter for new line'
                )}
              </span>
              
              {enableAdvancedFeatures && (
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-akilii-yellow" />
                  Advanced Features Active
                </span>
              )}
            </div>
            
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-akilii-pink" />
              Enhanced by akilii™
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default EnhancedChatInterface;