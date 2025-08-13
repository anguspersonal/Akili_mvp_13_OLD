import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Brain, 
  Lightbulb, 
  BookOpen, 
  Target, 
  Sparkles, 
  MessageCircle,
  Zap,
  Heart,
  Coffee,
  Rocket,
  Puzzle,
  Star
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User } from '../utils/types';

interface SuggestivePromptsProps {
  user?: User | null;
  onPromptSelect: (prompt: string) => void;
  disabled?: boolean;
  enhanced?: boolean;
  category?: 'general' | 'productivity' | 'creative' | 'learning' | 'personal';
}

interface PromptCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  prompts: string[];
}

export function SuggestivePrompts({ 
  user, 
  onPromptSelect, 
  disabled = false, 
  enhanced = false,
  category = 'general'
}: SuggestivePromptsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(category);
  const [currentPrompts, setCurrentPrompts] = useState<string[]>([]);

  // Base prompt categories with NPR adaptations
  const promptCategories: PromptCategory[] = [
    {
      id: 'general',
      name: 'General',
      icon: <MessageCircle className="h-4 w-4" />,
      color: 'akilii-gradient-primary',
      prompts: [
        "Hello! What can you help me with today?",
        "Tell me something interesting about AI and cognitive science",
        "How does NPR adaptation work in AI systems?",
        "What makes akilii™ different from other AI assistants?",
        "Can you explain complex topics in simple terms?",
        "What are your capabilities and limitations?"
      ]
    },
    {
      id: 'productivity',
      name: 'Productivity',
      icon: <Target className="h-4 w-4" />,
      color: 'akilii-gradient-secondary',
      prompts: [
        "Help me plan my day effectively",
        "What's the best way to manage my time?",
        "Create a to-do list template for me",
        "How can I improve my focus and concentration?",
        "Suggest productivity techniques for my work style",
        "Help me break down a large project into manageable tasks"
      ]
    },
    {
      id: 'creative',
      name: 'Creative',
      icon: <Lightbulb className="h-4 w-4" />,
      color: 'akilii-gradient-accent',
      prompts: [
        "Give me creative writing prompts",
        "Help me brainstorm ideas for a project",
        "What are some innovative problem-solving techniques?",
        "Suggest ways to boost my creativity",
        "Help me think outside the box",
        "Create a story outline based on my interests"
      ]
    },
    {
      id: 'learning',
      name: 'Learning',
      icon: <BookOpen className="h-4 w-4" />,
      color: 'akilii-text-gradient',
      prompts: [
        "Explain a complex topic in simple terms",
        "Help me create a study plan",
        "What's the best way to learn new skills?",
        "Suggest resources for learning about [topic]",
        "How can I improve my memory and retention?",
        "Create flashcards for studying"
      ]
    },
    {
      id: 'personal',
      name: 'Personal',
      icon: <Heart className="h-4 w-4" />,
      color: 'akilii-gradient-mesh',
      prompts: [
        "Help me reflect on my goals",
        "What are some self-care suggestions?",
        "How can I improve my communication skills?",
        "Suggest ways to build better habits",
        "Help me work through a decision",
        "What are some mindfulness techniques?"
      ]
    }
  ];

  // NPR-adaptive prompts based on user profile
  const getNPRAdaptivePrompts = (): string[] => {
    if (!user?.nprProfile) return [];

    const nprPrompts: string[] = [];

    // Add prompts based on cognitive style
    if (user.nprProfile.cognitiveStyle === 'visual') {
      nprPrompts.push(
        "Can you explain this concept using visual analogies?",
        "Help me create a mind map for this topic",
        "Show me this information in a structured, visual way"
      );
    } else if (user.nprProfile.cognitiveStyle === 'analytical') {
      nprPrompts.push(
        "Break down this problem step by step",
        "What are the logical connections between these concepts?",
        "Provide a detailed analysis of this topic"
      );
    } else if (user.nprProfile.cognitiveStyle === 'creative') {
      nprPrompts.push(
        "Help me approach this creatively",
        "What are some unconventional solutions to this problem?",
        "Let's explore this topic from multiple perspectives"
      );
    }

    // Add prompts based on learning preference
    if (user.nprProfile.learningPreference === 'hands-on') {
      nprPrompts.push(
        "Give me practical exercises to understand this",
        "What are some real-world applications of this concept?",
        "How can I practice this skill effectively?"
      );
    } else if (user.nprProfile.learningPreference === 'theoretical') {
      nprPrompts.push(
        "Explain the theoretical foundation of this topic",
        "What are the underlying principles here?",
        "Help me understand the broader context"
      );
    }

    // Add prompts based on communication style
    if (user.nprProfile.communicationStyle === 'direct') {
      nprPrompts.push(
        "Give me a concise summary of the key points",
        "What's the bottom line here?",
        "Skip the details and give me the main idea"
      );
    } else if (user.nprProfile.communicationStyle === 'detailed') {
      nprPrompts.push(
        "Provide a comprehensive explanation with examples",
        "I want to understand all the nuances of this topic",
        "Give me detailed background information"
      );
    }

    return nprPrompts;
  };

  // Enhanced prompts for advanced features
  const getEnhancedPrompts = (): string[] => {
    if (!enhanced) return [];

    return [
      "Test your streaming response capabilities",
      "Show me your advanced reasoning abilities",
      "Help me with a complex multi-step problem",
      "Demonstrate your contextual memory",
      "Create a detailed analysis with citations",
      "Generate content that adapts to my cognitive style"
    ];
  };

  // Role-specific prompts
  const getRoleSpecificPrompts = (): string[] => {
    if (!user?.role) return [];

    const rolePrompts: { [key: string]: string[] } = {
      student: [
        "Help me understand this assignment",
        "Create a study schedule for my exams",
        "Explain this concept for my coursework",
        "Help me prepare for presentations"
      ],
      professional: [
        "Help me draft a professional email",
        "Suggest ways to improve my workflow",
        "Help me prepare for a meeting",
        "Analyze market trends in my industry"
      ],
      researcher: [
        "Help me formulate research questions",
        "Suggest methodologies for my study",
        "Help me analyze data patterns",
        "Assist with literature review"
      ],
      creative: [
        "Help me overcome creative blocks",
        "Suggest inspiration sources",
        "Help me develop my artistic style",
        "Provide feedback on my creative work"
      ],
      educator: [
        "Help me create engaging lesson plans",
        "Suggest teaching strategies",
        "Help me explain complex concepts",
        "Create assessment materials"
      ]
    };

    return rolePrompts[user.role] || [];
  };

  // Update prompts when category or user changes
  useEffect(() => {
    const category = promptCategories.find(cat => cat.id === selectedCategory);
    const basePrompts = category?.prompts || [];
    const nprPrompts = getNPRAdaptivePrompts();
    const enhancedPrompts = getEnhancedPrompts();
    const rolePrompts = getRoleSpecificPrompts();

    // Combine and shuffle prompts
    const allPrompts = [
      ...basePrompts,
      ...nprPrompts,
      ...enhancedPrompts,
      ...rolePrompts
    ];

    // Remove duplicates and select random subset
    const uniquePrompts = Array.from(new Set(allPrompts));
    const shuffled = uniquePrompts.sort(() => Math.random() - 0.5);
    setCurrentPrompts(shuffled.slice(0, 6));
  }, [selectedCategory, user, enhanced]);

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      
      {/* Category Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-akilii-teal" />
          <span className="text-sm font-medium text-foreground">
            {enhanced ? 'Enhanced' : 'Suggested'} Prompts
          </span>
          {user?.nprProfile && (
            <Badge className="text-xs akilii-gradient-accent text-primary-foreground border-0">
              <Brain className="h-3 w-3 mr-1" />
              NPR-Adapted
            </Badge>
          )}
        </div>
        
        {enhanced && (
          <Badge className="text-xs akilii-gradient-primary text-primary-foreground border-0">
            <Zap className="h-3 w-3 mr-1" />
            Advanced
          </Badge>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {promptCategories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            disabled={disabled}
            className={`text-xs ${
              selectedCategory === cat.id 
                ? `${cat.color} text-primary-foreground` 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat.icon}
            <span className="ml-1">{cat.name}</span>
          </Button>
        ))}
      </div>

      {/* Prompt Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {currentPrompts.map((prompt, index) => (
          <motion.div
            key={`${selectedCategory}-${index}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <Button
              variant="ghost"
              onClick={() => onPromptSelect(prompt)}
              disabled={disabled}
              className="w-full text-left p-3 h-auto text-xs leading-relaxed hover:akilii-glass-elevated border border-transparent hover:border-border transition-all duration-200"
            >
              <div className="flex items-start gap-2">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {index % 5 === 0 && <Star className="h-3 w-3 text-akilii-yellow flex-shrink-0 mt-0.5" />}
                  {index % 5 === 1 && <Puzzle className="h-3 w-3 text-akilii-teal flex-shrink-0 mt-0.5" />}
                  {index % 5 === 2 && <Rocket className="h-3 w-3 text-akilii-pink flex-shrink-0 mt-0.5" />}
                  {index % 5 === 3 && <Coffee className="h-3 w-3 text-akilii-orange flex-shrink-0 mt-0.5" />}
                  {index % 5 === 4 && <Brain className="h-3 w-3 text-akilii-purple flex-shrink-0 mt-0.5" />}
                </motion.div>
                <span className="text-muted-foreground hover:text-foreground transition-colors">
                  {prompt}
                </span>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* NPR Info */}
      {user?.nprProfile && (
        <motion.div 
          className="p-3 akilii-glass rounded-lg border border-border"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Brain className="h-3 w-3 text-akilii-purple" />
            <span>
              Prompts personalized for your {user.nprProfile.cognitiveStyle} cognitive style 
              and {user.nprProfile.learningPreference} learning preference
            </span>
          </div>
        </motion.div>
      )}

      {/* Enhanced Features Info */}
      {enhanced && (
        <motion.div 
          className="p-3 akilii-glass rounded-lg border border-border"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="h-3 w-3 text-akilii-yellow" />
            <span>
              Enhanced prompts with advanced AI capabilities and real-time features
            </span>
          </div>
        </motion.div>
      )}

      {/* Custom Prompt Suggestion */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <p className="text-xs text-muted-foreground">
          💡 Don't see what you're looking for? Just type your own question!
          {user?.nprProfile && " I'll adapt my response to your cognitive style."}
        </p>
      </motion.div>
    </motion.div>
  );
}

export default SuggestivePrompts;