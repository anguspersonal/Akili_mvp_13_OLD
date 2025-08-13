import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Send, 
  Loader2, 
  Bot, 
  User, 
  Sparkles, 
  RefreshCw, 
  MessageSquare, 
  Brain, 
  Zap,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Paperclip,
  Image,
  FileText,
  X,
  Play,
  Pause,
  Camera,
  File,
  Download,
  Eye,
  Trash2,
  Upload,
  Plus,
  Lightbulb,
  ArrowUp,
  MessageCircle
} from 'lucide-react';
import { AnimatedAkiliiLogo } from '../AnimatedAkiliiLogo';
import { ThemeToggle } from '../ThemeToggle';
import { PremiumBackgroundElements } from '../PremiumBackgroundElements';
import { SpeechToText } from '../SpeechToText';
import { AuthUser, NPRUserProfile } from '../../utils/nprTypes';
import { nprService } from '../../utils/nprService';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { toast } from 'sonner@2.0.3';

interface NPRAIChatInterfaceProps {
  user: AuthUser;
  nprProfile: NPRUserProfile;
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  attachments?: FileAttachment[];
  audioUrl?: string;
  isPlaying?: boolean;
}

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  previewUrl?: string;
  content?: string; // For text files
  analysis?: string; // AI analysis of the file
}

interface FollowUpPrompt {
  id: string;
  text: string;
  category: 'clarification' | 'deepdive' | 'related' | 'action';
  icon?: string;
}

export function NPRAIChatInterface({ user, nprProfile, onBack }: NPRAIChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [followUpPrompts, setFollowUpPrompts] = useState<FollowUpPrompt[]>([]);
  const [showFollowUps, setShowFollowUps] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize text-to-speech
  useEffect(() => {
    return () => {
      if (speechSynthRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const initializeChat = () => {
    nprService.setUserId(user.id);
    
    const welcomeMessage: ChatMessage = {
      id: `welcome-${Date.now()}`,
      role: 'assistant',
      content: getWelcomeMessage(),
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    generateInitialFollowUps();
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  };

  const getWelcomeMessage = (): string => {
    const userName = user.user_metadata?.full_name || 'there';
    const goal = nprProfile.entries.goal?.content;
    const commStyle = nprProfile.profile?.comm_preference;
    
    let message = `Hello ${userName}! I'm your enhanced NPR-powered AI companion with multimodal capabilities. I can:

🎤 **Listen** to your voice input
📄 **Read** your documents and images  
🗣️ **Speak** responses aloud
💡 **Suggest** follow-up questions based on our conversation`;

    if (goal) {
      message += `\n\nI see you're working on: *${goal}*`;
    }
    
    if (commStyle) {
      const styleNote = commStyle === 'direct' 
        ? 'I\'ll provide direct, straightforward guidance.'
        : 'I\'ll use analogies and examples to explain things clearly.';
      message += `\n\n${styleNote}`;
    }
    
    message += '\n\nWhat would you like to explore today? Feel free to speak, type, or share files!';
    
    return message;
  };

  const generateInitialFollowUps = () => {
    const goal = nprProfile.entries.goal?.content;
    const challenge = nprProfile.entries.challenge?.content;
    const strength = nprProfile.entries.strength?.content;

    const prompts: FollowUpPrompt[] = [
      {
        id: 'explore-goal',
        text: goal ? `Help me make progress on: ${goal}` : 'Help me set clear goals',
        category: 'action',
        icon: '🎯'
      },
      {
        id: 'overcome-challenge', 
        text: challenge ? `I'm struggling with: ${challenge}` : 'What challenges should I focus on?',
        category: 'clarification',
        icon: '⚡'
      },
      {
        id: 'leverage-strength',
        text: strength ? `How can I use my strength in ${strength}?` : 'Help me identify my strengths',
        category: 'deepdive',
        icon: '💪'
      },
      {
        id: 'ai-capabilities',
        text: 'Show me what you can do with voice, files, and images',
        category: 'related',
        icon: '🤖'
      }
    ];

    setFollowUpPrompts(prompts);
    setShowFollowUps(true);
  };

  const generateContextualFollowUps = (lastMessage: string, conversation: ChatMessage[]) => {
    // AI-generated follow-up prompts based on conversation context
    const contextPrompts: FollowUpPrompt[] = [];
    
    const lastMessageLower = lastMessage.toLowerCase();
    
    // Smart follow-up generation based on content
    if (lastMessageLower.includes('goal') || lastMessageLower.includes('objective')) {
      contextPrompts.push({
        id: `followup-${Date.now()}-1`,
        text: 'How can I break this down into smaller steps?',
        category: 'action',
        icon: '📋'
      });
      contextPrompts.push({
        id: `followup-${Date.now()}-2`,
        text: 'What obstacles might I encounter?',
        category: 'clarification',
        icon: '⚠️'
      });
    }
    
    if (lastMessageLower.includes('learn') || lastMessageLower.includes('understand')) {
      contextPrompts.push({
        id: `followup-${Date.now()}-3`,
        text: 'Can you give me practical examples?',
        category: 'deepdive',
        icon: '💡'
      });
      contextPrompts.push({
        id: `followup-${Date.now()}-4`,
        text: 'What resources would help me learn more?',
        category: 'related',
        icon: '📚'
      });
    }
    
    if (lastMessageLower.includes('problem') || lastMessageLower.includes('challenge')) {
      contextPrompts.push({
        id: `followup-${Date.now()}-5`,
        text: 'What are some alternative approaches?',
        category: 'related',
        icon: '🔄'
      });
      contextPrompts.push({
        id: `followup-${Date.now()}-6`,
        text: 'How have others solved similar problems?',
        category: 'deepdive',
        icon: '🌟'
      });
    }

    // Add general contextual prompts
    contextPrompts.push({
      id: `followup-${Date.now()}-7`,
      text: 'Tell me more about this',
      category: 'deepdive',
      icon: '🔍'
    });
    
    contextPrompts.push({
      id: `followup-${Date.now()}-8`,
      text: 'How does this relate to my goals?',
      category: 'related',
      icon: '🎯'
    });

    // Randomly select 4-6 prompts
    const shuffled = contextPrompts.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(6, shuffled.length));
    
    setFollowUpPrompts(selected);
    setShowFollowUps(true);
  };

  const buildContextualPrompt = (question: string, files?: FileAttachment[]): string => {
    const userName = user.user_metadata?.full_name || 'User';
    const goal = nprProfile.entries.goal?.content;
    const commStyle = nprProfile.profile?.comm_preference;
    const challenge = nprProfile.entries.challenge?.content;
    const strength = nprProfile.entries.strength?.content;

    let context = `User Profile:\n`;
    context += `Name: ${userName}\n`;
    
    if (goal) context += `Primary Goal: ${goal}\n`;
    if (commStyle) {
      context += `Communication Style: ${commStyle === 'direct' ? 'Direct and straightforward' : 'Analogical with examples and metaphors'}\n`;
    }
    if (challenge) context += `Current Challenge: ${challenge}\n`;
    if (strength) context += `Key Strength: ${strength}\n`;
    
    // Add file context
    if (files && files.length > 0) {
      context += `\nAttached Files:\n`;
      files.forEach(file => {
        context += `- ${file.name} (${file.type})\n`;
        if (file.content) {
          context += `  Content: ${file.content.substring(0, 500)}${file.content.length > 500 ? '...' : ''}\n`;
        }
        if (file.analysis) {
          context += `  Analysis: ${file.analysis}\n`;
        }
      });
    }
    
    context += `\nInstructions: Please respond in a ${commStyle === 'direct' ? 'direct, clear, and concise' : 'thoughtful way using analogies and examples'} manner. If files are attached, reference them specifically in your response.\n\n`;
    context += `User Question: ${question}`;
    
    return context;
  };

  // File handling
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFiles(Array.from(files));
    }
    event.target.value = '';
  };

  const handleFiles = async (files: File[]) => {
    setUploadProgress(0);
    const newAttachments: FileAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      try {
        const attachment = await processFile(file);
        newAttachments.push(attachment);
        setUploadProgress(((i + 1) / files.length) * 100);
      } catch (error) {
        console.error('File processing error:', error);
        toast.error(`Failed to process ${file.name}`);
      }
    }

    setAttachedFiles(prev => [...prev, ...newAttachments]);
    
    if (newAttachments.length > 0) {
      toast.success(`${newAttachments.length} file(s) attached successfully`);
    }
    
    setUploadProgress(0);
  };

  const processFile = async (file: File): Promise<FileAttachment> => {
    const attachment: FileAttachment = {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    };

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      attachment.previewUrl = attachment.url;
    }

    // Extract text content for text files
    if (file.type.startsWith('text/') || file.type === 'application/pdf') {
      try {
        if (file.type === 'application/pdf') {
          // For demo purposes, we'll simulate PDF text extraction
          attachment.content = `[PDF content from ${file.name} - ${Math.floor(file.size / 1024)}KB]`;
        } else {
          attachment.content = await file.text();
        }
      } catch (error) {
        console.error('Text extraction error:', error);
      }
    }

    return attachment;
  };

  const removeAttachment = (fileId: string) => {
    setAttachedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      const removed = prev.find(f => f.id === fileId);
      if (removed) {
        URL.revokeObjectURL(removed.url);
      }
      return updated;
    });
  };

  // Speech-to-text handling
  const handleSpeechResult = (transcript: string) => {
    setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
    inputRef.current?.focus();
  };

  // Text-to-speech handling
  const speakMessage = (content: string, messageId: string) => {
    if (speechSynthRef.current) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => {
      setCurrentlyPlayingId(messageId);
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setCurrentlyPlayingId(null);
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setCurrentlyPlayingId(null);
      setIsSpeaking(false);
      toast.error('Speech synthesis failed');
    };

    speechSynthRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setCurrentlyPlayingId(null);
    setIsSpeaking(false);
  };

  // Main message sending function
  const handleSendMessage = async () => {
    if ((!inputValue.trim() && attachedFiles.length === 0) || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim() || '[Files attached]',
      timestamp: new Date(),
      attachments: [...attachedFiles]
    };

    const loadingMessage: ChatMessage = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    
    const currentInput = inputValue.trim();
    const currentFiles = [...attachedFiles];
    
    setInputValue('');
    setAttachedFiles([]);
    setIsLoading(true);
    setError(null);
    setShowFollowUps(false);

    try {
      const contextualPrompt = buildContextualPrompt(currentInput || 'Please analyze the attached files', currentFiles);
      const response = await nprService.generateAIResponse(contextualPrompt);
      
      if (response.success && response.content) {
        setMessages(prev => {
          const withoutLoading = prev.filter(msg => msg.id !== loadingMessage.id);
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: response.content,
            timestamp: new Date()
          };
          
          // Generate contextual follow-ups
          setTimeout(() => {
            generateContextualFollowUps(response.content, [...withoutLoading, assistantMessage]);
          }, 1000);
          
          return [...withoutLoading, assistantMessage];
        });
      } else {
        throw new Error(response.error || 'Failed to generate response');
      }

    } catch (error) {
      console.error('NPR AI Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get response';
      setError(errorMessage);
      
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => msg.id !== loadingMessage.id);
        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `I apologize, but I encountered an issue generating a response. This might be temporary - please try again. If the problem persists, the AI service may need attention.`,
          timestamp: new Date()
        };
        return [...withoutLoading, errorMsg];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFollowUpClick = (prompt: FollowUpPrompt) => {
    setInputValue(prompt.text);
    setShowFollowUps(false);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleRetry = () => {
    setError(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div 
      className="min-h-screen bg-background relative flex flex-col"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <PremiumBackgroundElements />
      
      {/* Drop overlay */}
      {dragActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-primary/10 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="akilii-glass-premium p-8 rounded-3xl border-2 border-dashed border-primary/50">
            <div className="text-center">
              <Upload className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Drop files here</h3>
              <p className="text-muted-foreground">Images, documents, and text files supported</p>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Enhanced Header */}
      <motion.header 
        className="akilii-glass-premium border-b border-border/20 relative z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <motion.button
                onClick={onBack}
                className="w-12 h-12 rounded-2xl akilii-glass-elevated flex items-center justify-center hover:akilii-glass-premium transition-all duration-300 group"
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="h-5 w-5 text-primary group-hover:text-primary transition-colors" />
              </motion.button>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <motion.div
                    className="w-12 h-12 rounded-2xl akilii-gradient-animated-button flex items-center justify-center"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <MessageSquare className="h-6 w-6 text-primary-foreground" />
                  </motion.div>
                  
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background flex items-center justify-center"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Brain className="h-2.5 w-2.5 text-white" />
                  </motion.div>
                </div>
                
                <div>
                  <h1 className="font-black text-xl text-foreground">Enhanced AI Chat</h1>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <p className="text-sm akilii-two-tone-text-subtle">
                      Voice • Files • Images • Smart Prompts
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {error && (
                <motion.button
                  onClick={handleRetry}
                  className="flex items-center gap-2 akilii-glass p-3 rounded-xl border border-red-500/30 hover:akilii-glass-elevated transition-all duration-300 text-red-500"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-xs font-medium">Retry</span>
                </motion.button>
              )}
              
              <motion.div
                className="flex items-center gap-3 akilii-glass p-2 rounded-xl border border-border/30"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="w-8 h-8 rounded-full akilii-gradient-animated-button flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground">
                    {user.user_metadata?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                
                <div className="text-left">
                  <p className="text-xs font-medium text-foreground">
                    {user.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs akilii-two-tone-text-subtle">
                    {nprProfile.profile?.comm_preference === 'direct' ? 'Direct' : 'Analogical'} Mode
                  </p>
                </div>
              </motion.div>
              
              <AnimatedAkiliiLogo size="sm" animated={true} />
              <ThemeToggle size="sm" />
            </div>
          </div>
        </div>
      </motion.header>

      {/* NPR Context Banner */}
      {nprProfile.entries.goal && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-primary/5 border-b border-primary/10 px-6 py-3 relative z-10"
        >
          <div className="max-w-7xl mx-auto">
            <p className="text-sm akilii-two-tone-text-subtle text-center">
              <span className="font-medium">Current Goal:</span> {nprProfile.entries.goal.content}
            </p>
          </div>
        </motion.div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto px-6 py-6 max-w-4xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`mb-6 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'akilii-gradient-animated-button' 
                      : 'akilii-glass-elevated border border-border/30'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-5 w-5 text-primary-foreground" />
                    ) : (
                      <Bot className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className="flex-1">
                    <div className={`${
                      message.role === 'user'
                        ? 'akilii-gradient-animated-button text-primary-foreground'
                        : 'akilii-glass-elevated border border-border/30 text-foreground'
                    } px-4 py-3 rounded-2xl relative`}>
                      
                      {/* File Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {message.attachments.map((file) => (
                            <div key={file.id} className="flex items-center gap-2 p-2 rounded-lg bg-black/10">
                              {file.type.startsWith('image/') ? (
                                <Image className="h-4 w-4" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                              <span className="text-xs font-medium">{file.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {(file.size / 1024).toFixed(1)}KB
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {message.isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Generating response...</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                          
                          {/* TTS Controls for Assistant Messages */}
                          {message.role === 'assistant' && !message.isLoading && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs"
                                onClick={() => {
                                  if (currentlyPlayingId === message.id) {
                                    stopSpeaking();
                                  } else {
                                    speakMessage(message.content, message.id);
                                  }
                                }}
                              >
                                {currentlyPlayingId === message.id ? (
                                  <>
                                    <Pause className="h-3 w-3 mr-1" />
                                    Stop
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="h-3 w-3 mr-1" />
                                    Listen
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Timestamp */}
                      <div className={`text-xs mt-2 opacity-70 ${
                        message.role === 'user' ? 'text-primary-foreground' : 'akilii-two-tone-text-subtle'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Follow-up Prompts */}
          <AnimatePresence>
            {showFollowUps && followUpPrompts.length > 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <div className="max-w-[85%]">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Continue the conversation:</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {followUpPrompts.map((prompt, index) => (
                      <motion.button
                        key={prompt.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleFollowUpClick(prompt)}
                        className="text-left p-3 rounded-xl akilii-glass border border-border/30 hover:akilii-glass-elevated transition-all duration-200 group"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{prompt.icon}</span>
                          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                            {prompt.text}
                          </span>
                          <ArrowUp className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors ml-auto transform rotate-45" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setShowFollowUps(false)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-3"
                  >
                    Hide suggestions
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area with Enhanced Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="border-t border-border/20 bg-background/95 backdrop-blur-sm relative z-10"
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          
          {/* File Attachments Preview */}
          {attachedFiles.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {attachedFiles.length} file{attachedFiles.length > 1 ? 's' : ''} attached
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-2 akilii-glass p-2 rounded-lg border border-border/30">
                    {file.type.startsWith('image/') ? (
                      <div className="relative">
                        <Image className="h-4 w-4" />
                        {file.previewUrl && (
                          <img 
                            src={file.previewUrl} 
                            alt={file.name}
                            className="w-8 h-8 object-cover rounded ml-2"
                          />
                        )}
                      </div>
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    
                    <span className="text-xs font-medium truncate max-w-24">
                      {file.name}
                    </span>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeAttachment(file.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Upload Progress */}
          {uploadProgress > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Processing files...</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
          
          {/* Input Row */}
          <div className="flex items-end gap-3">
            
            {/* File Upload Button */}
            <Button
              size="sm"
              variant="ghost"
              className="h-12 w-12 p-0 rounded-2xl akilii-glass border border-border/30 hover:akilii-glass-elevated"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Plus className="h-5 w-5 text-muted-foreground" />
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,text/*,application/pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {/* Voice Input */}
            <div className="relative">
              <SpeechToText 
                onTranscript={handleSpeechResult}
                disabled={isLoading}
              />
            </div>
            
            {/* Text Input */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask me anything${attachedFiles.length > 0 ? ' about your files' : ''}...`}
                className="w-full px-4 py-3 pr-12 rounded-2xl akilii-glass-elevated border border-border/30 bg-input-background text-foreground placeholder:akilii-two-tone-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 resize-none"
                disabled={isLoading}
              />
            </div>
            
            {/* Send Button */}
            <motion.button
              onClick={handleSendMessage}
              disabled={(!inputValue.trim() && attachedFiles.length === 0) || isLoading}
              className="w-12 h-12 rounded-2xl akilii-gradient-animated-button flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" />
              ) : (
                <Send className="h-5 w-5 text-primary-foreground" />
              )}
            </motion.button>
          </div>
          
          {/* Feature Hints */}
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Mic className="h-3 w-3" />
              <span>Press to speak</span>
            </div>
            <div className="flex items-center gap-1">
              <Image className="h-3 w-3" />
              <span>Drag & drop files</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              <span>Smart suggestions</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced NPR Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="fixed bottom-6 left-6 z-30 pointer-events-none max-w-xs"
      >
        <div className="akilii-glass-premium p-4 rounded-2xl border border-border/20">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="h-5 w-5 text-primary animate-pulse" />
            <span className="font-bold text-foreground">Enhanced NPR Chat</span>
          </div>
          <p className="text-xs akilii-two-tone-text-subtle leading-relaxed mb-2">
            Multimodal AI with voice, vision, documents, and contextual follow-up suggestions.
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Style: {nprProfile.profile?.comm_preference === 'direct' ? 'Direct' : 'Analogical'}
            </span>
            <div className="flex items-center gap-1">
              <Brain className="h-3 w-3 text-primary" />
              <span className="text-primary">Active</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}