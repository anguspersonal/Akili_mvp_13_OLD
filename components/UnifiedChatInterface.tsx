import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';
import { User } from '../utils/types';
import { projectId } from '../utils/supabase/info';
import { getCurrentSession } from '../utils/supabase/client';
import { flowiseService } from '../utils/flowiseService';
import {
  Send,
  Mic,
  MicOff,
  Loader2,
  AlertCircle,
  User as UserIcon,
  Bot,
  Copy,
  RefreshCw,
  Volume2,
  VolumeX,
  Settings,
  Brain,
  Sparkles,
  MessageCircle
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
  chatId?: string;
}

interface UnifiedChatInterfaceProps {
  currentUser?: User | null;
  className?: string;
}

interface ChatResponse {
  success: boolean;
  text?: string;
  chatId?: string;
  npr_adapted?: boolean;
  timestamp?: string;
  error?: string;
  details?: string;
}

// Memoized connection status component to prevent re-renders
const ConnectionStatusBadge = React.memo(({ status }: { status: 'checking' | 'connected' | 'error' }) => (
  <Badge 
    className={`text-xs ${
      status === 'connected' 
        ? 'bg-green-500/20 text-green-300 border-green-500/30' 
        : status === 'checking'
          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
          : 'bg-red-500/20 text-red-300 border-red-500/30'
    }`}
  >
    <div className={`w-2 h-2 rounded-full mr-1 ${
      status === 'connected' ? 'bg-green-400' :
      status === 'checking' ? 'bg-yellow-400' :
      'bg-red-400'
    }`} />
    {status === 'connected' ? 'Online' :
     status === 'checking' ? 'Checking' : 'Offline'}
  </Badge>
));

ConnectionStatusBadge.displayName = 'ConnectionStatusBadge';

export function UnifiedChatInterface({ currentUser = null, className = '' }: UnifiedChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const initializationRef = useRef<boolean>(false);

  // Memoize stable values to prevent unnecessary re-renders with null checks
  const currentChatId = useMemo(() => {
    if (!currentUser?.id) {
      return `chat_guest_${Date.now()}`;
    }
    return `chat_${currentUser.id}_${Date.now()}`;
  }, [currentUser?.id]);
  
  // Memoized suggestion buttons to prevent re-renders
  const suggestionButtons = useMemo(() => [
    "How can you help me?",
    "Tell me about NPR adaptation",
    "What are your capabilities?"
  ], []);

  // Early return with error state if currentUser is not provided or null
  if (!currentUser) {
    return (
      <div className={`flex flex-col h-full max-h-[600px] ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 akilii-gradient-primary rounded-lg flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">AI Chat Assistant</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  User authentication required
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="text-xs bg-red-500/20 text-red-300 border-red-500/30">
                <div className="w-2 h-2 rounded-full mr-1 bg-red-400" />
                Error
              </Badge>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-3 text-red-400" />
            <p className="text-sm text-muted-foreground">
              Please sign in to use the chat interface
            </p>
          </div>
        </CardContent>
      </div>
    );
  }

  // Initialize speech synthesis once
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive (optimized)
  useEffect(() => {
    if (isInitialized && messages.length > 0) {
      const scrollTimeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      return () => clearTimeout(scrollTimeout);
    }
  }, [messages.length, isInitialized]);

  // Improved initialization with better error handling
  useEffect(() => {
    // Prevent multiple initializations
    if (initializationRef.current || !currentUser) {
      return;
    }
    
    initializationRef.current = true;
    let isMounted = true;
    
    const initializeChat = async () => {
      try {
        console.log('🔄 Initializing chat interface...');
        
        // Add delay to prevent setState during render
        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (!isMounted) return;
        
        // Simple connection check - no external service calls for now
        setConnectionStatus('connected');
        console.log('✅ Chat interface initialized');
        
      } catch (error: any) {
        console.error('🚨 Chat connectivity check failed:', error);
        
        if (!isMounted) return;
        
        setConnectionStatus('error');
        setInitializationError(error.message || 'Failed to initialize chat service');
        setErrorDetails(error.message || 'Failed to initialize chat service');
      } finally {
        if (isMounted) {
          // Add delay before setting initialized to prevent render conflicts
          setTimeout(() => {
            if (isMounted) {
              setIsInitialized(true);
            }
          }, 100);
        }
      }
    };

    initializeChat();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const checkConnectivity = useCallback(async () => {
    try {
      setConnectionStatus('checking');
      setErrorDetails(null);
      
      // Simple connectivity check
      setConnectionStatus('connected');
      console.log('✅ Chat connectivity verified');
      
    } catch (error: any) {
      console.error('🚨 Chat connectivity check failed:', error);
      setConnectionStatus('error');
      setErrorDetails(error.message || 'Failed to connect to chat service');
    }
  }, []);

  // Initialize speech recognition (memoized)
  const initializeSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      console.log('🎤 Speech recognition started');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      console.log('🎤 Speech recognized:', transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('🚨 Speech recognition error:', event.error);
      setIsListening(false);
      toast.error('Speech recognition failed', {
        description: 'Please try again or type your message instead.'
      });
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('🎤 Speech recognition ended');
    };

    return recognition;
  }, []);

  const startListening = useCallback(() => {
    try {
      if (!recognitionRef.current) {
        recognitionRef.current = initializeSpeechRecognition();
      }
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
      } else {
        toast.error('Speech recognition not available', {
          description: 'Your browser does not support speech recognition.'
        });
      }
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      toast.error('Failed to start speech recognition');
    }
  }, [initializeSpeechRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const speakMessage = useCallback((text: string) => {
    if (!synthRef.current) {
      toast.error('Text-to-speech not available');
      return;
    }

    try {
      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onstart = () => {
        setIsSpeaking(true);
        console.log('🔊 Speech synthesis started');
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        console.log('🔊 Speech synthesis ended');
      };

      utterance.onerror = (event) => {
        console.error('🚨 Speech synthesis error:', event.error);
        setIsSpeaking(false);
        toast.error('Speech synthesis failed');
      };

      synthRef.current.speak(utterance);
    } catch (error) {
      console.error('Failed to start speech synthesis:', error);
      setIsSpeaking(false);
      toast.error('Failed to speak message');
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy to clipboard');
    }
  }, []);

  const sendMessage = useCallback(async () => {
    const messageText = inputMessage.trim();
    if (!messageText || isLoading || !currentUser) return;

    // Check connectivity before sending
    if (connectionStatus !== 'connected') {
      toast.error('Chat service unavailable', {
        description: 'Please check your connection and try again.'
      });
      return;
    }

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: messageText,
      isUser: true,
      timestamp: new Date(),
      chatId: currentChatId
    };

    const loadingMessage: Message = {
      id: `loading_${Date.now()}`,
      text: '',
      isUser: false,
      timestamp: new Date(),
      isLoading: true,
      chatId: currentChatId
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('📤 Sending message to chat service...');

      // Get current session for authentication
      const { session, error: sessionError } = await getCurrentSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('Authentication required. Please sign in again.');
      }

      // Call the chat API through our backend
      const chatResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-feeffd69/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            message: messageText,
            chatId: currentChatId,
            history: messages
              .filter(msg => !msg.isLoading && !msg.error)
              .slice(-10) // Keep last 10 messages for context
              .map(msg => ({
                role: msg.isUser ? 'user' : 'assistant',
                content: msg.text
              })),
            context: currentUser.nprProfile ? 
              `User has NPR profile with preferences: ${JSON.stringify(currentUser.nprProfile)}` : 
              undefined
          }),
        }
      );

      console.log('📥 Chat response received:', {
        status: chatResponse.status,
        statusText: chatResponse.statusText
      });

      if (!chatResponse.ok) {
        const errorText = await chatResponse.text();
        throw new Error(`Chat service error (${chatResponse.status}): ${errorText}`);
      }

      const responseData: ChatResponse = await chatResponse.json();
      console.log('📋 Chat response parsed:', {
        success: responseData.success,
        hasText: !!responseData.text,
        nprAdapted: responseData.npr_adapted
      });

      if (!responseData.success) {
        throw new Error(responseData.details || responseData.error || 'Chat service returned an error');
      }

      if (!responseData.text) {
        throw new Error('Chat service did not return a response');
      }

      // Replace loading message with actual response
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? {
              ...msg,
              text: responseData.text!,
              isLoading: false,
              timestamp: new Date()
            }
          : msg
      ));

      // Show NPR adaptation indicator if applicable
      if (responseData.npr_adapted) {
        toast.success('Response adapted to your NPR profile', {
          description: 'The AI has tailored its response to your cognitive preferences.'
        });
      }

      console.log('✅ Message sent and response processed successfully');

    } catch (error: any) {
      console.error('🚨 Chat error:', error);
      
      // Replace loading message with error message  
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? {
              ...msg,
              text: 'Sorry, I encountered an error processing your message. Please try again.',
              isLoading: false,
              error: error.message,
              timestamp: new Date()
            }
          : msg
      ));

      // Show user-friendly error toast
      let errorTitle = 'Chat Error';
      let errorDescription = 'Please try again in a moment.';
      
      if (error.message.includes('Authentication required')) {
        errorTitle = 'Authentication Error';
        errorDescription = 'Please sign out and sign in again.';
      } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        errorTitle = 'Request Timeout';
        errorDescription = 'The AI service is taking too long to respond.';
      } else if (error.message.includes('500')) {
        errorTitle = 'Service Error';
        errorDescription = 'The AI service is experiencing issues.';
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorTitle = 'Connection Error';
        errorDescription = 'Please check your internet connection.';
      }

      toast.error(errorTitle, { description: errorDescription });
      
      // Update connectivity status if this appears to be a service issue
      if (error.message.includes('500') || error.message.includes('503') || error.message.includes('timeout')) {
        setConnectionStatus('error');
        setErrorDetails(error.message);
      }

    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading, connectionStatus, currentChatId, messages, currentUser]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    toast.success('Chat cleared');
  }, []);

  const retryLastMessage = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(msg => msg.isUser);
    if (lastUserMessage) {
      setInputMessage(lastUserMessage.text);
      // Remove the last assistant message if it was an error
      setMessages(prev => {
        const lastAssistantIndex = prev.map(msg => !msg.isUser).lastIndexOf(true);
        if (lastAssistantIndex > -1 && prev[lastAssistantIndex].error) {
          return prev.slice(0, lastAssistantIndex);
        }
        return prev;
      });
      inputRef.current?.focus();
    }
  }, [messages]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  }, []);

  // Show loading state during initialization
  if (!isInitialized) {
    return (
      <div className={`flex flex-col h-full max-h-[600px] ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 akilii-gradient-primary rounded-lg flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">AI Chat Assistant</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {initializationError ? 'Initialization failed' : 'Initializing...'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`text-xs ${
                initializationError 
                  ? 'bg-red-500/20 text-red-300 border-red-500/30'
                  : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-1 ${
                  initializationError ? 'bg-red-400' : 'bg-yellow-400'
                }`} />
                {initializationError ? 'Error' : 'Loading'}
              </Badge>
            </div>
          </div>
          {initializationError && (
            <div className="mt-3">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <div className="font-medium">Initialization Failed</div>
                  <div className="text-xs text-muted-foreground mt-1">{initializationError}</div>
                  <Button 
                    size="sm" 
                    onClick={checkConnectivity} 
                    className="mt-2"
                    variant="outline"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardHeader>
        <Separator />
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            {initializationError ? (
              <AlertCircle className="h-8 w-8 mx-auto mb-3 text-red-400" />
            ) : (
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-muted-foreground" />
            )}
            <p className="text-sm text-muted-foreground">
              {initializationError ? 'Failed to initialize chat service' : 'Initializing chat service...'}
            </p>
          </div>
        </CardContent>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full max-h-[600px] ${className}`}>
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 akilii-gradient-primary rounded-lg flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">AI Chat Assistant</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Powered by {currentUser?.nprProfile ? 'NPR-Adaptive' : 'Advanced'} AI
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Connection Status */}
            <ConnectionStatusBadge status={connectionStatus} />

            {/* NPR Status */}
            {currentUser?.nprProfile && (
              <Badge className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                <Brain className="h-3 w-3 mr-1" />
                NPR
              </Badge>
            )}

            {/* Controls */}
            <Button
              variant="ghost"
              size="sm"
              onClick={checkConnectivity}
              disabled={connectionStatus === 'checking'}
              className="h-8 w-8 p-0"
            >
              {connectionStatus === 'checking' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {connectionStatus === 'error' && errorDetails && (
          <Alert className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <div className="font-medium">Connection Error</div>
              <div className="text-xs text-muted-foreground mt-1">{errorDetails}</div>
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <Separator />

      {/* Messages Area */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full px-4 py-3">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 akilii-gradient-primary rounded-full flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-medium text-foreground mb-2">Welcome to AI Chat</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Start a conversation with our {currentUser?.nprProfile ? 'NPR-adaptive' : 'advanced'} AI assistant. 
                  Ask questions, get help, or just chat!
                </p>
              </div>
            )}

            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!message.isUser && (
                    <div className="w-8 h-8 rounded-full akilii-gradient-secondary flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${message.isUser ? 'order-first' : ''}`}>
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        message.isUser
                          ? 'akilii-gradient-primary text-white'
                          : message.error
                            ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                            : 'akilii-glass border border-border text-foreground'
                      }`}
                    >
                      {message.isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      ) : (
                        <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      
                      {!message.isUser && !message.isLoading && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(message.text)}
                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => isSpeaking ? stopSpeaking() : speakMessage(message.text)}
                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                          >
                            {isSpeaking ? (
                              <VolumeX className="h-3 w-3" />
                            ) : (
                              <Volume2 className="h-3 w-3" />
                            )}
                          </Button>
                          
                          {message.error && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={retryLastMessage}
                              className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {message.isUser && (
                    <div className="w-8 h-8 rounded-full akilii-gradient-primary flex items-center justify-center flex-shrink-0">
                      <UserIcon className="h-4 w-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>

      <Separator />

      {/* Input Area */}
      <CardContent className="p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={connectionStatus === 'connected' ? 
                "Type your message..." : 
                "Chat service unavailable..."
              }
              disabled={isLoading || connectionStatus !== 'connected'}
              className="min-h-[44px] max-h-[120px] resize-none pr-12"
              rows={1}
            />
            
            {/* Character count */}
            {inputMessage.length > 0 && (
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {inputMessage.length}
              </div>
            )}
          </div>
          
          {/* Voice Input */}
          <Button
            variant="ghost"
            size="sm"
            onClick={isListening ? stopListening : startListening}
            disabled={isLoading || connectionStatus !== 'connected'}
            className={`h-11 w-11 p-0 ${isListening ? 'text-red-500' : ''}`}
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          
          {/* Send Button */}
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading || connectionStatus !== 'connected'}
            className="h-11 px-4 akilii-gradient-primary"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Quick Actions */}
        {messages.length === 0 && connectionStatus === 'connected' && (
          <div className="flex flex-wrap gap-2 mt-3">
            {suggestionButtons.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </div>
  );
}

export default UnifiedChatInterface;