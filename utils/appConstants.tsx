import { MessageSquare, Target, Heart, CheckSquare, Brain, TrendingUp, Activity, Zap, Shield, Coffee, Sun, Moon, Frown, Smile, Meh } from 'lucide-react';
import { NPRUserProfile, NPRTask } from './nprTypes';

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  isEnhanced?: boolean;
  isPremium?: boolean;
  gradient?: string;
}

export const createQuickActions = (
  nprProfile: NPRUserProfile | null,
  tasks: NPRTask[],
  actions: {
    setCurrentView: (view: string) => void;
  }
): QuickAction[] => [
  {
    id: 'ai-chat',
    title: 'AI Chat',
    description: nprProfile?.profile?.comm_preference 
      ? `${nprProfile.profile.comm_preference === 'direct' ? 'Direct' : 'Analogical'} guidance`
      : 'Cognitive companion',
    icon: MessageSquare,
    action: () => actions.setCurrentView('ai-chat'),
    isEnhanced: !!nprProfile,
    isPremium: true,
    gradient: 'from-blue-500/20 via-purple-500/20 to-pink-500/20'
  },
  {
    id: 'tasks',
    title: 'Tasks',
    description: tasks.length > 0 
      ? `${tasks.filter(t => !t.is_completed).length} active`
      : 'AI recommendations',
    icon: CheckSquare,
    action: () => actions.setCurrentView('tasks'),
    isEnhanced: tasks.some(t => t.is_ai_generated),
    isPremium: tasks.some(t => t.is_ai_generated),
    gradient: 'from-green-500/20 via-emerald-500/20 to-teal-500/20'
  },
  {
    id: 'goals',
    title: 'Goals',
    description: nprProfile?.entries.goal ? 'Update journey' : 'Define path',
    icon: Target,
    action: () => actions.setCurrentView('goals'),
    gradient: 'from-orange-500/20 via-yellow-500/20 to-amber-500/20'
  },
  {
    id: 'mood',
    title: 'Mood',
    description: 'Track state',
    icon: Heart,
    action: () => actions.setCurrentView('mood'),
    gradient: 'from-pink-500/20 via-rose-500/20 to-red-500/20'
  }
];

export const STATS_CONFIG = [
  {
    valueKey: 'nprEntries',
    label: 'NPR Entries',
    icon: 'Brain',
    color: 'from-blue-500/20 to-purple-500/20'
  },
  {
    valueKey: 'aiTasks',
    label: 'AI Tasks',
    icon: 'Sparkles',
    color: 'from-green-500/20 to-emerald-500/20'
  },
  {
    valueKey: 'completed',
    label: 'Completed',
    icon: 'CheckSquare',
    color: 'from-orange-500/20 to-yellow-500/20'
  }
];

// Goal Options for Goal Setting Interface
export const goalOptions = [
  {
    id: 'career',
    title: 'Career Growth',
    description: 'Advance in your professional journey',
    icon: TrendingUp,
    color: 'from-blue-500/20 to-indigo-500/20',
    suggestions: [
      'Learn a new skill for my current role',
      'Get promoted within the next year',
      'Switch to a new career field',
      'Start my own business',
      'Improve work-life balance',
      'Build a professional network'
    ]
  },
  {
    id: 'health',
    title: 'Health & Wellness',
    description: 'Improve your physical and mental wellbeing',
    icon: Activity,
    color: 'from-green-500/20 to-emerald-500/20',
    suggestions: [
      'Exercise regularly and build fitness',
      'Improve my nutrition and eating habits',
      'Reduce stress and anxiety levels',
      'Get better quality sleep',
      'Practice mindfulness and meditation',
      'Break unhealthy habits'
    ]
  },
  {
    id: 'learning',
    title: 'Learning & Development',
    description: 'Expand your knowledge and skills',
    icon: Brain,
    color: 'from-purple-500/20 to-pink-500/20',
    suggestions: [
      'Master a new programming language',
      'Learn a foreign language',
      'Read more books regularly',
      'Take an online course or certification',
      'Develop creative skills (art, music, writing)',
      'Improve communication skills'
    ]
  },
  {
    id: 'relationships',
    title: 'Relationships',
    description: 'Strengthen connections with others',
    icon: Heart,
    color: 'from-pink-500/20 to-rose-500/20',
    suggestions: [
      'Spend more quality time with family',
      'Make new meaningful friendships',
      'Improve romantic relationship',
      'Be more present in conversations',
      'Practice empathy and active listening',
      'Resolve conflicts constructively'
    ]
  },
  {
    id: 'personal',
    title: 'Personal Growth',
    description: 'Develop yourself and build confidence',
    icon: Zap,
    color: 'from-yellow-500/20 to-orange-500/20',
    suggestions: [
      'Build self-confidence and self-esteem',
      'Overcome fears and limiting beliefs',
      'Develop emotional intelligence',
      'Practice gratitude and positivity',
      'Set better boundaries',
      'Find my life purpose and passion'
    ]
  },
  {
    id: 'financial',
    title: 'Financial Security',
    description: 'Improve your financial situation',
    icon: Shield,
    color: 'from-emerald-500/20 to-teal-500/20',
    suggestions: [
      'Create and stick to a budget',
      'Build an emergency fund',
      'Pay off debt systematically',
      'Start investing for the future',
      'Increase my income streams',
      'Plan for retirement'
    ]
  }
];

// Mood Options for Mood Check Interface
export const moodOptions = [
  {
    id: 'amazing',
    label: 'Amazing',
    emoji: '🌟',
    icon: Sun,
    color: 'from-yellow-400 to-orange-400',
    bgColor: 'from-yellow-50 to-orange-50',
    description: 'Feeling fantastic and energetic',
    value: 10
  },
  {
    id: 'great',
    label: 'Great',
    emoji: '😊',
    icon: Smile,
    color: 'from-green-400 to-teal-400',
    bgColor: 'from-green-50 to-teal-50',
    description: 'In a really good mood',
    value: 8
  },
  {
    id: 'good',
    label: 'Good',
    emoji: '🙂',
    icon: Smile,
    color: 'from-blue-400 to-indigo-400',
    bgColor: 'from-blue-50 to-indigo-50',
    description: 'Feeling positive and content',
    value: 7
  },
  {
    id: 'okay',
    label: 'Okay',
    emoji: '😐',
    icon: Meh,
    color: 'from-gray-400 to-slate-400',
    bgColor: 'from-gray-50 to-slate-50',
    description: 'Neutral, neither good nor bad',
    value: 5
  },
  {
    id: 'tired',
    label: 'Tired',
    emoji: '😴',
    icon: Coffee,
    color: 'from-purple-400 to-indigo-400',
    bgColor: 'from-purple-50 to-indigo-50',
    description: 'Feeling low energy or exhausted',
    value: 4
  },
  {
    id: 'stressed',
    label: 'Stressed',
    emoji: '😰',
    icon: Zap,
    color: 'from-orange-400 to-red-400',
    bgColor: 'from-orange-50 to-red-50',
    description: 'Feeling overwhelmed or anxious',
    value: 3
  },
  {
    id: 'sad',
    label: 'Sad',
    emoji: '😢',
    icon: Frown,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'from-blue-50 to-blue-100',
    description: 'Feeling down or melancholy',
    value: 2
  },
  {
    id: 'terrible',
    label: 'Terrible',
    emoji: '😭',
    icon: Moon,
    color: 'from-red-500 to-red-600',
    bgColor: 'from-red-50 to-red-100',
    description: 'Having a really difficult time',
    value: 1
  }
];

// Mood tracking helpers
export const getMoodByValue = (value: number) => {
  return moodOptions.find(mood => mood.value === value) || moodOptions.find(mood => mood.id === 'okay');
};

export const getMoodById = (id: string) => {
  return moodOptions.find(mood => mood.id === id);
};

export const getMoodColor = (moodId: string) => {
  const mood = getMoodById(moodId);
  return mood ? mood.color : 'from-gray-400 to-slate-400';
};

export const getMoodEmoji = (moodId: string) => {
  const mood = getMoodById(moodId);
  return mood ? mood.emoji : '😐';
};

// Goal tracking helpers
export const getGoalById = (id: string) => {
  return goalOptions.find(goal => goal.id === id);
};

export const getGoalColor = (goalId: string) => {
  const goal = getGoalById(goalId);
  return goal ? goal.color : 'from-gray-400 to-slate-400';
};

export const getRandomGoalSuggestion = (goalId: string) => {
  const goal = getGoalById(goalId);
  if (!goal || !goal.suggestions.length) return null;
  
  const randomIndex = Math.floor(Math.random() * goal.suggestions.length);
  return goal.suggestions[randomIndex];
};

export type CurrentView = 'auth' | 'onboarding' | 'home' | 'ai-chat' | 'goals' | 'mood' | 'tasks';